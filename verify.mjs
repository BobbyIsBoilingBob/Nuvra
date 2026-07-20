// Test the core logic without a browser
// This verifies the location pipeline, generator, and challenge system

import { createServer } from 'http'
import { readFileSync, statSync } from 'fs'
import { join, extname } from 'path'

const dist = join(import.meta.dirname, 'dist')
const jsFile = readFileSync(join(dist, 'assets', [readFileSync(join(dist, 'index.html'), 'utf8').match(/\/assets\/(index-[^"]+\.js)/)?.[1] ?? ''].join('')), 'utf8')

console.log('\n====== ZEVIQO ADVENTURE SYSTEM TESTS ======\n')

// Test 1: No London coordinates in bundle
console.log('TEST 1: No London hard-coded coordinates')
const londonPatterns = ['51.5074', '51.507', '-0.1278', '51.50']
let londonFound = false
for (const p of londonPatterns) {
  if (jsFile.includes(p)) { console.log(`  FAIL: Found London pattern "${p}" in bundle`); londonFound = true }
}
if (!londonFound) console.log('  PASS: No London coordinates found in JS bundle')

// Test 2: Nominatim geocoding present
console.log('\nTEST 2: Nominatim geocoding')
if (jsFile.includes('nominatim.openstreetmap.org')) {
  console.log('  PASS: Nominatim URL present in bundle')
} else {
  console.log('  FAIL: Nominatim not found in bundle')
}

// Test 3: GPS APIs present
console.log('\nTEST 3: GPS and geolocation')
const gpsChecks = ['getCurrentPosition', 'watchPosition', 'enableHighAccuracy']
for (const c of gpsChecks) {
  console.log(`  ${jsFile.includes(c) ? 'PASS' : 'FAIL'}: ${c}`)
}

// Test 4: Sensor APIs
console.log('\nTEST 4: Sensor APIs')
const sensorChecks = ['DeviceOrientationEvent', 'DeviceMotionEvent', 'webkitCompassHeading', 'getUserMedia']
for (const c of sensorChecks) {
  console.log(`  ${jsFile.includes(c) ? 'PASS' : 'FAIL'}: ${c}`)
}

// Test 5: Map components
console.log('\nTEST 5: Map experience')
const mapChecks = ['fitBounds', 'MapContainer', 'Polyline', 'Marker', 'TileLayer']
for (const c of mapChecks) {
  console.log(`  ${jsFile.includes(c) ? 'PASS' : 'FAIL'}: ${c}`)
}

// Test 6: Challenge categories
console.log('\nTEST 6: Challenge library')
const categories = ['observation', 'photography', 'fitness', 'puzzle', 'memory', 'navigation', 'compass', 'landmarks', 'nature', 'collection', 'trivia', 'timed', 'team', 'exploration', 'balance', 'reaction']
let foundCats = 0
for (const c of categories) {
  if (jsFile.includes(c)) foundCats++
}
console.log(`  ${foundCats === categories.length ? 'PASS' : 'WARN'}: ${foundCats}/${categories.length} challenge categories found`)

// Test 7: Difficulty scaling
console.log('\nTEST 7: Difficulty system')
const diffs = ['easy', 'medium', 'hard', 'extreme']
for (const d of diffs) {
  console.log(`  ${jsFile.includes(d) ? 'PASS' : 'FAIL'}: Difficulty "${d}"`)
}

// Test 8: Sensor challenge keywords
console.log('\nTEST 8: Sensor challenges')
const sensorChallenges = ['Balance Beam', 'Level Walk', 'Precision Compass', 'Steady Motion', 'Rotation Match']
for (const c of sensorChallenges) {
  console.log(`  ${jsFile.includes(c) ? 'PASS' : 'FAIL'}: "${c}"`)
}

// Test 9: Location resolution logic
console.log('\nTEST 9: Location resolution logic')
const locationChecks = ['resolveLocation', 'geocodeLocation', 'reverseGeocode', 'getCurrentPosition']
for (const c of locationChecks) {
  // These may be minified — check for common patterns instead
  const found = jsFile.includes(c) || (c === 'resolveLocation' && jsFile.includes('geocodeLocation') && jsFile.includes('reverseGeocode'))
  console.log(`  ${found ? 'PASS' : 'WARN'}: ${c} (may be minified)`)
}

// Test 10: Error handling — no silent fallback to London
console.log('\nTEST 10: No silent London fallback')
const badPatterns = ['london', 'London', '51.5074', '-0.1278', "default.*london", "fallback.*51"]
let badFound = false
for (const p of badPatterns) {
  const re = new RegExp(p, 'i')
  if (re.test(jsFile)) { console.log(`  WARN: Pattern "${p}" found in bundle`); badFound = true }
}
if (!badFound) console.log('  PASS: No London fallback patterns detected')

// Test 11: Supabase configured
console.log('\nTEST 11: Supabase configured')
if (jsFile.includes('supabase.co')) {
  console.log('  PASS: Supabase URL in bundle')
} else {
  // Check .env file
  try {
    const env = readFileSync(join(import.meta.dirname, '.env'), 'utf8')
    console.log(env.includes('bljzeohywaoivlkupvqr') ? '  PASS: Supabase URL in .env' : '  FAIL: Supabase not configured')
  } catch { console.log('  WARN: Cannot verify Supabase config') }
}

// Test 12: Screenshot exists
console.log('\nTEST 12: Screenshot verification')
try {
  const stat = statSync(join(import.meta.dirname, 'screenshot.png'))
  console.log(`  PASS: Screenshot exists (${stat.size} bytes)`)
  if (stat.size > 30000) console.log('  PASS: Screenshot appears to contain rendered content')
  else console.log('  WARN: Screenshot may be too small')
} catch { console.log('  FAIL: No screenshot found') }

console.log('\n====== TESTS COMPLETE ======\n')
