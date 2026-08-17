# Tecom Home Assistant Tiles

Custom Lovelace tiles for the **Tecom ChallengerPlus Home Assistant integration**.

These tiles provide a simple dashboard interface for:

* Alarm area control
* Door control
* Optional physical door reed/contact state
* Relay control
* Optional timezone/schedule running state

The tiles are designed to work with entities exposed by the Tecom ChallengerPlus integration.

---

## Included Tiles

### Alarm Tile

```yaml
type: custom:tecom-alarm-tile
```

Provides a compact alarm control tile for a Home Assistant `alarm_control_panel` entity.

Example:

```yaml
type: custom:tecom-alarm-tile
entity: alarm_control_panel.area_1
name: House Alarm
```

Optional button labels can be customised:

```yaml
type: custom:tecom-alarm-tile
entity: alarm_control_panel.area_1
name: Area 1
arm_home_label: Stay
arm_away_label: Away
disarm_label: Disarm
```

---

### Door Tile

```yaml
type: custom:tecom-door-tile
```

Provides door control using a Home Assistant `lock` entity.

A separate reed/contact sensor can optionally be assigned so the tile displays the **true physical door state** rather than relying only on the lock state.

Example without a reed switch:

```yaml
type: custom:tecom-door-tile
entity: lock.front_door
name: Front Door
```

Example with a reed/contact sensor:

```yaml
type: custom:tecom-door-tile
entity: lock.front_door
reed_entity: binary_sensor.front_door_contact
name: Front Door
confirm_open: true
```

When `reed_entity` is configured:

* `on` = Door Open
* `off` = Door Closed

This lets the tile separately display:

* Door control/lock state
* Actual physical open/closed state

This is useful because a door can be unlocked while still physically closed, or it may still be open after the lock output has returned to its secure state.

---

### Relay Tile

```yaml
type: custom:tecom-relay-tile
```

Provides a tile for a relay/output exposed to Home Assistant.

Example:

```yaml
type: custom:tecom-relay-tile
entity: switch.relay_1
name: External Lighting
```

A timezone or schedule entity can also be linked so the tile shows whether the associated schedule is currently active.

Example:

```yaml
type: custom:tecom-relay-tile
entity: switch.relay_1
name: External Lighting
timezone_entity: binary_sensor.external_lighting_timezone
timezone_label: Timezone
```

---

# Installation

## 1. Download the Tile File

Download:

```text
tecom_control_tiles.js
```

from the GitHub repository.

---

## 2. Copy the File to Home Assistant

Copy the file into the Home Assistant `www` directory:

```text
/config/www/tecom_control_tiles.js
```

If the `www` directory does not already exist, create it.

You can copy the file using:

* Studio Code Server
* File Editor
* Samba Share
* SSH/SFTP
* Another Home Assistant file management method

Home Assistant exposes files inside `/config/www/` through the `/local/` URL path.

Therefore:

```text
/config/www/tecom_control_tiles.js
```

is accessed by Home Assistant as:

```text
/local/tecom_control_tiles.js
```

---

## 3. Add the JavaScript Resource

In Home Assistant, go to:

**Settings → Dashboards → Resources**

Select **Add Resource**.

Enter:

```text
/local/tecom_control_tiles.js
```

Set the resource type to:

```text
JavaScript Module
```

Save the resource.

> The Resources menu may only be visible when **Advanced Mode** is enabled for your Home Assistant user profile.

---

## 4. Refresh Home Assistant

After adding or updating the JavaScript file, refresh Home Assistant.

If the tile does not appear immediately, perform a hard browser refresh or clear the Home Assistant frontend cache.

---

# Adding Tiles to a Dashboard

Open the required Home Assistant dashboard and select:

**Edit Dashboard → Add Card → Manual**

Paste the required YAML.

---

## Alarm Control Example

```yaml
type: custom:tecom-alarm-tile
entity: alarm_control_panel.area_1
name: Area 1
```

---

## Door Control Example

```yaml
type: custom:tecom-door-tile
entity: lock.front_entry
name: Front Entry
confirm_open: true
```

Where supported, the tile uses the Home Assistant door/open function. Otherwise, it can fall back to the normal lock/unlock behaviour provided by the entity.

---

## Door Control with Reed Switch

For the most accurate representation of the door state, assign the Tecom input associated with the physical door reed/contact.

```yaml
type: custom:tecom-door-tile
entity: lock.front_entry
reed_entity: binary_sensor.front_entry_door_contact
name: Front Entry
confirm_open: true
```

This separates the two important states:

**Door Control**

```text
Locked / Unlocked
```

**Physical Door State**

```text
Open / Closed
```

---

# Timezone / Schedule Status

A timezone or schedule entity can optionally be assigned to supported tiles.

This is useful where a Tecom timezone or schedule controls:

* Relays
* Lighting
* Gates
* HVAC
* Door access periods
* After-hours functions
* Other automated outputs

The tile can then display whether the associated schedule is currently active.

---

## Relay with Timezone Status

```yaml
type: custom:tecom-relay-tile
entity: switch.relay_1
name: Car Park Lighting
timezone_entity: binary_sensor.car_park_lighting_timezone
timezone_label: Timezone
```

Example display:

```text
Car Park Lighting
Relay: ON
Timezone: Running
```

---

## Door with Timezone Status

```yaml
type: custom:tecom-door-tile
entity: lock.front_entry
reed_entity: binary_sensor.front_entry_door_contact
timezone_entity: binary_sensor.business_hours
timezone_label: Access Hours
name: Front Entry
confirm_open: true
```

This allows a single tile to display:

* Door control state
* Physical reed/contact state
* Current timezone/schedule state

---

## Home Assistant Schedule Entity

The timezone status does not have to come directly from Tecom.

A Home Assistant `schedule` entity can also be used:

```yaml
type: custom:tecom-relay-tile
entity: switch.relay_5
name: External Lighting
timezone_entity: schedule.external_lighting
timezone_label: Schedule
```

---

## Custom Timezone States

If the entity uses a particular active state, it can be specified manually.

Example:

```yaml
type: custom:tecom-relay-tile
entity: switch.relay_5
name: Roller Door Relay
timezone_entity: sensor.roller_door_schedule
timezone_active_state: running
timezone_label: Schedule
timezone_active_label: Active
timezone_inactive_label: Idle
```

Available timezone-related options include:

```yaml
timezone_entity:
timezone_label:
timezone_active_state:
timezone_active_label:
timezone_inactive_label:
```

---

# Example Dashboard Layout

The tiles can be placed inside a standard Home Assistant grid card.

```yaml
type: grid
columns: 2
square: false
cards:
  - type: custom:tecom-alarm-tile
    entity: alarm_control_panel.area_1
    name: House Alarm

  - type: custom:tecom-door-tile
    entity: lock.front_entry
    reed_entity: binary_sensor.front_entry_door_contact
    timezone_entity: binary_sensor.business_hours
    timezone_label: Access Hours
    name: Front Entry
    confirm_open: true

  - type: custom:tecom-relay-tile
    entity: switch.relay_1
    timezone_entity: binary_sensor.external_lighting_timezone
    timezone_label: Timezone
    name: External Lighting

  - type: custom:tecom-relay-tile
    entity: switch.relay_2
    name: Gate Control
```

---

# Door Confirmation

For doors, it is recommended to enable confirmation before sending an open/release command:

```yaml
confirm_open: true
```

A custom confirmation message can also be configured:

```yaml
confirm_open: true
confirm_open_message: Release Front Entry?
```

This helps prevent accidental door releases from a dashboard.

---

# Changing Button Labels

Some labels can be customised to suit the terminology used at your site.

Alarm example:

```yaml
type: custom:tecom-alarm-tile
entity: alarm_control_panel.area_1
name: Administration
arm_home_label: Stay
arm_away_label: Arm
disarm_label: Disarm
```

Door example:

```yaml
type: custom:tecom-door-tile
entity: lock.front_entry
name: Front Entry
open_label: Release
confirm_open: true
```

---

# Updating the Tiles

When a new version of `tecom_control_tiles.js` is released:

1. Download the new file.
2. Replace the existing file at:

```text
/config/www/tecom_control_tiles.js
```

3. Refresh Home Assistant.
4. If the old version is still displayed, perform a hard browser refresh or clear the Home Assistant frontend cache.

You normally do **not** need to add the Lovelace resource again if the filename and path remain unchanged.

---

# Troubleshooting

## Custom Element Doesn't Exist

If Home Assistant displays an error similar to:

```text
Custom element doesn't exist: tecom-door-tile
```

or:

```text
Custom element doesn't exist: tecom-alarm-tile
```

check that the JavaScript file exists at:

```text
/config/www/tecom_control_tiles.js
```

and that the dashboard resource is configured as:

```text
/local/tecom_control_tiles.js
```

with the resource type:

```text
JavaScript Module
```

Then perform a hard refresh of Home Assistant.

---

## Tile Displays Entity Not Found

Check that the entity ID in the YAML exactly matches the entity shown under:

**Settings → Devices & Services → Entities**

For example:

```yaml
entity: lock.front_entry
```

must correspond to an existing Home Assistant entity.

---

## Reed Switch State Is Incorrect

Check the state of the configured reed entity under:

**Developer Tools → States**

The expected binary sensor states are normally:

```text
on
off
```

with:

```text
on  = Open
off = Closed
```

If the Tecom input is represented differently, verify the input configuration and entity state before assigning it to the tile.

---

## Timezone Always Shows Inactive

Open:

**Developer Tools → States**

and inspect the entity assigned to:

```yaml
timezone_entity:
```

Check its exact state while the timezone is active.

If required, configure that value explicitly:

```yaml
timezone_active_state: running
```

For example:

```yaml
timezone_entity: sensor.business_hours
timezone_active_state: active
```

---

## Changes Are Not Appearing

Browsers can cache JavaScript resources aggressively.

Try:

1. Hard refreshing the browser.
2. Closing and reopening the Home Assistant mobile app.
3. Clearing the browser cache.
4. Confirming the updated file exists in `/config/www/`.

For testing, the resource URL can temporarily be given a version suffix:

```text
/local/tecom_control_tiles.js?v=2
```

When the file is updated again:

```text
/local/tecom_control_tiles.js?v=3
```

This forces the browser to request a fresh copy.

---

# Notes

These tiles provide a frontend interface only.

The actual controls and states available depend on the entities and capabilities exposed by the **Tecom ChallengerPlus Home Assistant integration**.

For example:

* Alarm controls require an `alarm_control_panel` entity.
* Door controls require a `lock` entity.
* Physical door state requires a suitable reed/contact `binary_sensor`.
* Relay controls require an appropriate Home Assistant entity such as a `switch`.
* Timezone display requires an entity that represents whether the relevant timezone or schedule is active.

Always confirm that the underlying Home Assistant entity operates correctly before relying on the custom tile.

---

# Minimal Example

```yaml
type: grid
columns: 2
square: false
cards:
  - type: custom:tecom-alarm-tile
    entity: alarm_control_panel.area_1
    name: Alarm

  - type: custom:tecom-door-tile
    entity: lock.front_door
    reed_entity: binary_sensor.front_door_contact
    name: Front Door
    confirm_open: true
```

---

## Tecom ChallengerPlus Home Assistant Integration

For integration installation, configuration, supported entities, troubleshooting and releases, refer to the main project documentation in the GitHub repository.
