import { useEffect, useRef, useState, useCallback } from 'react'
import { MapContainer, TileLayer, Marker, Polyline, Circle, useMap } from 'react-leaflet'
import L from 'leaflet'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/authStore'
import {
  type Coordinates,
  haversineDistance,
  formatDistance,
  estimateSteps,
  generateWaypoints,
} from '../lib/gps'
import { addXpAndCoins, updateWalkingStats, getRandomTreasure, addInventoryItem, checkAchievements, createNotification, logActivity, updateProfileStats } from '../lib/gameService'
import type { Profile, PlayerLocation } from '../types'
import { ADVENTURE_TYPES } from '../lib/gameData'

const WAYPOINT_REACH_RADIUS = 30

const WAYPOINT_ICON = L.divIcon({
  className: 'waypoint-marker',
  html: '<div style="width:28px;height:28px;border-radius:50%;background:#f59e0b;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;font-size:14px;">📍</div>',
  iconSize: [28, 28],
  iconAnchor: [14, 14],
})

const REACHED_ICON = L.divIcon({
  className: 'waypoint-marker',
  html: '<div style="width:28px;height:28px;border-radius:50%;background:#22c55e;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;font-size:14px;">✓</div>',
  iconSize: [28, 28],
  iconAnchor: [14, 14],
})

const NEARBY_ICON = L.divIcon({
  className: 'waypoint-marker',
  html: '<div style="width:24px;height:24px;border-radius:50%;background:#8b5cf6;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);"></div>',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
})

interface ActiveAdventure {
  id: string
  type: string
  waypoints: Coordinates[]
  reachedWaypoints: boolean[]
  rewardXp: number
  rewardCoins: number
  targetDistance: number | null
  distanceTraveled: number
}

function MapController({ center }: { center: Coordinates | null }) {
  const map = useMap()

  useEffect(() => {
    if (center) {
      map.setView([center.lat, center.lng], map.getZoom() || 16, { animate: true })
    }
  }, [center, map])

  return null
}

export function MapPage() {
  const { profile, user, refreshProfile } = useAuthStore()
  const [position, setPosition] = useState<Coordinates | null>(null)
  const [heading, setHeading] = useState<number | null>(null)
  const [accuracy, setAccuracy] = useState<number | null>(null)
  const [gpsError, setGpsError] = useState<string | null>(null)
  const [tracking, setTracking] = useState(false)
  const [activeAdventure, setActiveAdventure] = useState<ActiveAdventure | null>(null)
  const [nearbyPlayers, setNearbyPlayers] = useState<PlayerLocation[]>([])
  const [showAdventureMenu, setShowAdventureMenu] = useState(false)
  const [rewardPopup, setRewardPopup] = useState<{ xp: number; coins: number; item?: string } | null>(null)
  const [totalDistance, setTotalDistance] = useState(0)
  const [sessionDistance, setSessionDistance] = useState(0)

  const watchIdRef = useRef<number | null>(null)
  const lastPositionRef = useRef<Coordinates | null>(null)
  const positionRef = useRef<Coordinates | null>(null)
  const adventureRef = useRef<ActiveAdventure | null>(null)
  const profileRef = useRef<Profile | null>(null)
  const locationUpdateTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    profileRef.current = profile
  }, [profile])

  useEffect(() => {
    adventureRef.current = activeAdventure
  }, [activeAdventure])

  useEffect(() => {
    positionRef.current = position
  }, [position])

  // Load active adventure from database
  useEffect(() => {
    if (!user) return
    loadActiveAdventure()
  }, [user])

  const loadActiveAdventure = async () => {
    if (!user) return
    const { data } = await supabase
      .from('adventures')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (data) {
      const waypoints = (data.waypoints as Array<{ lat: number; lng: number; label: string; reached: boolean }>).map((w) => ({
        lat: w.lat,
        lng: w.lng,
      }))
      const reachedWaypoints = (data.waypoints as Array<{ lat: number; lng: number; label: string; reached: boolean }>).map((w) => w.reached)
      setActiveAdventure({
        id: data.id,
        type: data.type,
        waypoints,
        reachedWaypoints,
        rewardXp: data.reward_xp,
        rewardCoins: data.reward_coins,
        targetDistance: data.target_distance,
        distanceTraveled: 0,
      })
    }
  }

  // Start GPS tracking
  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      setGpsError('GPS is not supported on this device.')
      return
    }

    setTracking(true)
    setGpsError(null)

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const newPos = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        setPosition(newPos)
        setAccuracy(pos.coords.accuracy || null)

        if (pos.coords.heading !== null && !isNaN(pos.coords.heading)) {
          setHeading(pos.coords.heading)
        }

        // Calculate distance moved
        if (lastPositionRef.current) {
          const dist = haversineDistance(lastPositionRef.current, newPos)
          // Only count if movement is significant (> 2m) and accuracy is reasonable
          if (dist > 2 && (pos.coords.accuracy || 999) < 50) {
            setSessionDistance((prev) => prev + dist)
            setTotalDistance((prev) => prev + dist)
            checkWaypoints(newPos)
          }
        }
        lastPositionRef.current = newPos
      },
      (err) => {
        let msg = 'Unable to get your location.'
        if (err.code === 1) msg = 'Location access denied. Please enable GPS permissions.'
        else if (err.code === 2) msg = 'Position unavailable. Check your GPS settings.'
        else if (err.code === 3) msg = 'Location request timed out. Please try again.'
        setGpsError(msg)
        setTracking(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 5000,
      }
    )

    // Update player location in DB periodically for multiplayer
    locationUpdateTimerRef.current = setInterval(async () => {
      const currentPos = positionRef.current
      const currentUser = user
      if (!currentPos || !currentUser) return

      const { data: existing } = await supabase
        .from('player_locations')
        .select('id')
        .eq('user_id', currentUser.id)
        .maybeSingle()

      if (existing) {
        await supabase
          .from('player_locations')
          .update({
            latitude: currentPos.lat,
            longitude: currentPos.lng,
            heading: heading,
          })
          .eq('user_id', currentUser.id)
      } else {
        await supabase
          .from('player_locations')
          .insert({
            user_id: currentUser.id,
            latitude: currentPos.lat,
            longitude: currentPos.lng,
            heading: heading,
          })
      }

      // Fetch nearby players
      if (currentPos) {
        const { data: players } = await supabase
          .from('player_locations')
          .select('*, profiles!player_locations_user_id_fkey(username, avatar_emoji, avatar_color)')
          .neq('user_id', currentUser.id)
          .limit(20)

        if (players) {
          const nearby = players.filter((p) => {
            const dist = haversineDistance(currentPos, { lat: p.latitude, lng: p.longitude })
            return dist < 500 // Within 500m
          })
          setNearbyPlayers(nearby as unknown as PlayerLocation[])
        }
      }
    }, 10000)
  }, [user, heading])

  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current)
      watchIdRef.current = null
    }
    if (locationUpdateTimerRef.current) {
      clearInterval(locationUpdateTimerRef.current)
      locationUpdateTimerRef.current = null
    }
    setTracking(false)

    // Save walking stats to database
    if (user && totalDistance > 0) {
      const steps = estimateSteps(totalDistance)
      updateWalkingStats(user.id, totalDistance, steps)

      // Check achievements
      const currentProfile = profileRef.current
      if (currentProfile) {
        checkAchievements(user.id, {
          steps: currentProfile.steps + steps,
          distance_walked: currentProfile.distance_walked + totalDistance,
          completed_adventures: currentProfile.completed_adventures,
          treasure_collected: currentProfile.treasure_collected,
          level: currentProfile.level,
          coins: currentProfile.coins,
          walking_streak: currentProfile.walking_streak,
          friends: 0,
          completed_challenges: currentProfile.completed_challenges,
        })
      }

      refreshProfile()
    }

    setSessionDistance(0)
    setTotalDistance(0)
  }, [user, totalDistance, refreshProfile])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current)
      }
      if (locationUpdateTimerRef.current) {
        clearInterval(locationUpdateTimerRef.current)
      }
    }
  }, [])

  const checkWaypoints = (currentPos: Coordinates) => {
    const adv = adventureRef.current
    if (!adv) return

    let updated = false
    const newReached = [...adv.reachedWaypoints]

    adv.waypoints.forEach((wp, i) => {
      if (!newReached[i]) {
        const dist = haversineDistance(currentPos, wp)
        if (dist < WAYPOINT_REACH_RADIUS) {
          newReached[i] = true
          updated = true
        }
      }
    })

    if (updated) {
      const allReached = newReached.every((r) => r)
      const updatedAdv = { ...adv, reachedWaypoints: newReached }
      setActiveAdventure(updatedAdv)

      // Update waypoints in database
      if (user) {
        const waypointsData = adv.waypoints.map((wp, i) => ({
          lat: wp.lat,
          lng: wp.lng,
          label: `Checkpoint ${i + 1}`,
          reached: newReached[i],
        }))
        supabase
          .from('adventures')
          .update({ waypoints: waypointsData })
          .eq('id', adv.id)
          .then(() => {})

        if (allReached) {
          completeAdventure(updatedAdv)
        }
      }
    }
  }

  const completeAdventure = async (adv: ActiveAdventure) => {
    if (!user) return

    // Mark adventure as completed
    await supabase
      .from('adventures')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
      })
      .eq('id', adv.id)

    // Award XP and coins
    const { profile: updatedProfile } = await addXpAndCoins(user.id, adv.rewardXp, adv.rewardCoins)

    // Random treasure
    const treasure = await getRandomTreasure()
    if (treasure) {
      await addInventoryItem(user.id, treasure.itemId, treasure.itemName, 'treasure', treasure.rarity as 'common' | 'rare' | 'epic' | 'legendary', treasure.icon)
      await updateProfileStats(user.id, { treasure_collected: (profileRef.current?.treasure_collected || 0) + 1 })
    }

    // Update completed adventures count
    const newCompletedCount = (profileRef.current?.completed_adventures || 0) + 1
    await updateProfileStats(user.id, { completed_adventures: newCompletedCount })

    // Create notification and log activity
    await createNotification(user.id, 'adventure', 'Adventure Complete!', `You earned ${adv.rewardXp} XP and ${adv.rewardCoins} coins${treasure ? `, plus a ${treasure.itemName}!` : ''}`)
    await logActivity(user.id, 'adventure_completed', `Completed ${adv.type} adventure`, { xp: adv.rewardXp, coins: adv.rewardCoins })

    // Check achievements
    if (updatedProfile) {
      await checkAchievements(user.id, {
        steps: updatedProfile.steps,
        distance_walked: updatedProfile.distance_walked,
        completed_adventures: newCompletedCount,
        treasure_collected: (profileRef.current?.treasure_collected || 0) + 1,
        level: updatedProfile.level,
        coins: updatedProfile.coins,
        walking_streak: updatedProfile.walking_streak,
        friends: 0,
        completed_challenges: updatedProfile.completed_challenges,
      })
    }

    setRewardPopup({ xp: adv.rewardXp, coins: adv.rewardCoins, item: treasure?.itemName })
    setActiveAdventure(null)
    refreshProfile()
  }

  const startAdventure = async (typeIndex: number) => {
    if (!user || !position) {
      setGpsError('Need GPS location to start an adventure. Enable tracking first.')
      return
    }

    const advType = ADVENTURE_TYPES[typeIndex]
    const waypointCount = advType.type === 'treasure_hunt' ? 5 : advType.type === 'checkpoint' ? 4 : 3
    const radius = advType.type === 'exploration' ? 300 : 200
    const waypoints = generateWaypoints(position, waypointCount, radius)

    const waypointData = waypoints.map((wp, i) => ({
      lat: wp.lat,
      lng: wp.lng,
      label: `Checkpoint ${i + 1}`,
      reached: false,
    }))

    const targetDistance = advType.type === 'distance_walk' ? 500 + Math.floor(Math.random() * 500) : null

    const { data, error } = await supabase
      .from('adventures')
      .insert({
        user_id: user.id,
        type: advType.type,
        status: 'active',
        target_distance: targetDistance,
        waypoints: waypointData,
        reward_xp: advType.baseXp + Math.floor(Math.random() * 30),
        reward_coins: advType.baseCoins + Math.floor(Math.random() * 50),
      })
      .select('*')
      .single()

    if (error) {
      console.error('Failed to create adventure:', error)
      return
    }

    setActiveAdventure({
      id: data.id,
      type: data.type,
      waypoints,
      reachedWaypoints: new Array(waypoints.length).fill(false),
      rewardXp: data.reward_xp,
      rewardCoins: data.reward_coins,
      targetDistance: data.target_distance,
      distanceTraveled: 0,
    })

    setShowAdventureMenu(false)
  }

  const abandonAdventure = async () => {
    if (!activeAdventure || !user) return

    await supabase
      .from('adventures')
      .update({ status: 'abandoned' })
      .eq('id', activeAdventure.id)

    setActiveAdventure(null)
  }

  const playerIcon = L.divIcon({
    className: 'player-marker',
    html: `<div class="player-marker-inner" style="background:${profile?.avatar_color || '#1c7af5'};${heading !== null ? `transform:rotate(${heading}deg);` : ''}"></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  })

  return (
    <div className="relative h-full flex flex-col">
      {/* Map */}
      <div className="flex-1 relative">
        {position ? (
          <MapContainer
            center={[position.lat, position.lng]}
            zoom={16}
            className="h-full w-full"
            zoomControl={false}
            attributionControl={true}
          >
            <TileLayer
              url={profile?.settings?.mapType === 'satellite'
                ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
                : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
              }
              attribution={profile?.settings?.mapType === 'satellite'
                ? 'Tiles &copy; Esri'
                : '&copy; OpenStreetMap contributors'
              }
              maxZoom={20}
            />
            <MapController center={position} />

            {/* Player marker */}
            <Marker position={[position.lat, position.lng]} icon={playerIcon} />

            {/* Accuracy circle */}
            {accuracy && accuracy < 100 && (
              <Circle
                center={[position.lat, position.lng]}
                radius={accuracy}
                pathOptions={{ color: '#1c7af5', fillColor: '#3399ff', fillOpacity: 0.1, weight: 1 }}
              />
            )}

            {/* Adventure waypoints */}
            {activeAdventure && activeAdventure.waypoints.map((wp, i) => (
              <Marker
                key={i}
                position={[wp.lat, wp.lng]}
                icon={activeAdventure.reachedWaypoints[i] ? REACHED_ICON : WAYPOINT_ICON}
              />
            ))}

            {/* Path between waypoints */}
            {activeAdventure && activeAdventure.waypoints.length > 1 && (
              <Polyline
                positions={[
                  [position.lat, position.lng] as [number, number],
                  ...activeAdventure.waypoints.map((wp) => [wp.lat, wp.lng] as [number, number]),
                ]}
                pathOptions={{ color: '#f59e0b', weight: 2, opacity: 0.5, dashArray: '8 8' }}
              />
            )}

            {/* Nearby players */}
            {nearbyPlayers.map((np) => (
              <Marker
                key={np.id}
                position={[np.latitude, np.longitude]}
                icon={NEARBY_ICON}
              />
            ))}
          </MapContainer>
        ) : (
          <div className="h-full flex items-center justify-center bg-neutral-100">
            <div className="text-center p-8">
              <div className="text-5xl mb-4 animate-bounce-soft">🧭</div>
              <p className="text-neutral-500 font-medium">
                {gpsError ? gpsError : 'Waiting for GPS signal...'}
              </p>
              {!gpsError && (
                <div className="mt-4">
                  <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto" />
                </div>
              )}
            </div>
          </div>
        )}

        {/* GPS accuracy indicator */}
        {position && accuracy && (
          <div className="absolute top-3 left-3 z-[1000] bg-white/90 backdrop-blur-sm rounded-full px-3 py-1.5 shadow-md border border-neutral-200">
            <span className="text-xs font-medium text-neutral-600">
              GPS: {accuracy < 20 ? '🟢' : accuracy < 50 ? '🟡' : '🔴'} ±{Math.round(accuracy)}m
            </span>
          </div>
        )}

        {/* Session stats overlay */}
        {tracking && (
          <div className="absolute top-3 right-3 z-[1000] bg-white/90 backdrop-blur-sm rounded-2xl px-4 py-2.5 shadow-md border border-neutral-200">
            <div className="flex items-center gap-3 text-sm">
              <div>
                <span className="text-neutral-400 text-xs">Distance</span>
                <p className="font-bold text-neutral-900">{formatDistance(sessionDistance)}</p>
              </div>
              <div className="w-px h-8 bg-neutral-200" />
              <div>
                <span className="text-neutral-400 text-xs">Steps</span>
                <p className="font-bold text-neutral-900">{estimateSteps(sessionDistance)}</p>
              </div>
            </div>
          </div>
        )}

        {/* Active adventure banner */}
        {activeAdventure && (
          <div className="absolute bottom-4 left-4 right-4 z-[1000] bg-white/95 backdrop-blur-lg rounded-2xl shadow-lg border border-neutral-200 p-4 animate-slide-up">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{ADVENTURE_TYPES.find((t) => t.type === activeAdventure.type)?.icon}</span>
                <div>
                  <h3 className="font-bold text-neutral-900 text-sm">{ADVENTURE_TYPES.find((t) => t.type === activeAdventure.type)?.label}</h3>
                  <p className="text-xs text-neutral-500">
                    {activeAdventure.reachedWaypoints.filter((r) => r).length}/{activeAdventure.waypoints.length} checkpoints
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="badge bg-primary-50 text-primary-700">+{activeAdventure.rewardXp} XP</span>
                <span className="badge bg-accent-50 text-accent-700">+{activeAdventure.rewardCoins} 🪙</span>
                <button
                  onClick={abandonAdventure}
                  className="text-neutral-400 hover:text-error-500 text-xs font-medium px-2"
                >
                  Cancel
                </button>
              </div>
            </div>
            {/* Progress bar */}
            <div className="w-full h-2 bg-neutral-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary-500 rounded-full transition-all duration-500"
                style={{
                  width: `${(activeAdventure.reachedWaypoints.filter((r) => r).length / activeAdventure.waypoints.length) * 100}%`,
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Bottom controls */}
      <div className="absolute bottom-20 left-0 right-0 z-[1000] flex justify-center pointer-events-none">
        <div className="flex gap-3 pointer-events-auto">
          {!tracking ? (
            <button
              onClick={startTracking}
              className="btn-primary shadow-xl rounded-full px-6 py-3.5"
            >
              ▶ Start Walking
            </button>
          ) : (
            <button
              onClick={stopTracking}
              className="btn shadow-xl rounded-full px-6 py-3.5 bg-error-500 text-white hover:bg-error-600"
            >
              ⏹ Stop & Save
            </button>
          )}

          {!activeAdventure && (
            <button
              onClick={() => setShowAdventureMenu(true)}
              className="btn shadow-xl rounded-full px-6 py-3.5 bg-white text-neutral-800 hover:bg-neutral-100 border border-neutral-200"
            >
              🧭 New Adventure
            </button>
          )}
        </div>
      </div>

      {/* Adventure menu modal */}
      {showAdventureMenu && (
        <div
          className="fixed inset-0 z-[2000] bg-black/50 flex items-end sm:items-center justify-center p-4 animate-fade-in"
          onClick={() => setShowAdventureMenu(false)}
        >
          <div
            className="card w-full max-w-md p-6 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-display font-bold text-neutral-900 mb-1">Choose Adventure</h2>
            <p className="text-sm text-neutral-500 mb-5">Pick an adventure type to begin.</p>

            <div className="space-y-3">
              {ADVENTURE_TYPES.map((adv, i) => (
                <button
                  key={adv.type}
                  onClick={() => startAdventure(i)}
                  disabled={!position}
                  className="w-full flex items-center gap-3 p-4 rounded-xl border border-neutral-200 hover:border-primary-300 hover:bg-primary-50 transition-all text-left disabled:opacity-50 disabled:pointer-events-none"
                >
                  <span className="text-3xl">{adv.icon}</span>
                  <div className="flex-1">
                    <h3 className="font-semibold text-neutral-900">{adv.label}</h3>
                    <p className="text-xs text-neutral-500">{adv.description}</p>
                    <div className="flex gap-2 mt-1">
                      <span className="badge bg-primary-50 text-primary-600">+{adv.baseXp}+ XP</span>
                      <span className="badge bg-accent-50 text-accent-600">+{adv.baseCoins}+ 🪙</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {!position && (
              <p className="text-xs text-warning-600 mt-3 text-center">
                Enable GPS tracking to start an adventure.
              </p>
            )}

            <button
              onClick={() => setShowAdventureMenu(false)}
              className="btn-ghost w-full mt-4"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Reward popup */}
      {rewardPopup && (
        <div
          className="fixed inset-0 z-[3000] bg-black/60 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setRewardPopup(null)}
        >
          <div
            className="card w-full max-w-sm p-8 text-center animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-6xl mb-4 animate-bounce-soft">🎉</div>
            <h2 className="text-2xl font-display font-extrabold text-neutral-900 mb-2">Adventure Complete!</h2>
            <div className="flex justify-center gap-4 mb-4">
              <div className="flex flex-col items-center">
                <span className="text-3xl font-bold text-primary-600">+{rewardPopup.xp}</span>
                <span className="text-xs text-neutral-500">XP</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-3xl font-bold text-accent-600">+{rewardPopup.coins}</span>
                <span className="text-xs text-neutral-500">Coins</span>
              </div>
            </div>
            {rewardPopup.item && (
              <div className="rounded-xl bg-accent-50 border border-accent-200 p-3 mb-4">
                <p className="text-sm text-accent-700 font-medium">🎁 Found: {rewardPopup.item}</p>
              </div>
            )}
            <button onClick={() => setRewardPopup(null)} className="btn-primary w-full">
              Awesome!
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
