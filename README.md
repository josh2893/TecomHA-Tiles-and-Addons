# Tecom Home Assistant Tiles

Custom Lovelace tiles for the **[Tecom ChallengerPlus Home Assistant integration](https://github.com/josh2893/TecomHA)**.

These tiles provide a simple dashboard interface for:

- Alarm area control, including force arm
- Door control, lock/unlock and momentary open
- Optional physical door reed/contact state
- Last access, showing who came through
- Relay control
- Optional timezone/schedule running state

The tiles are a frontend only. All behaviour comes from the entities exposed by the Tecom ChallengerPlus integration.

---

## Compatibility

| Tiles | Integration | Notes |
|---|---|---|
| Current | **3.3.0 or later** | Required for force arm, alarm cause and access user display |
| Current | 3.2.x | Alarm and relay tiles work; force arm and last access are hidden |

The tiles degrade gracefully on older integration versions — features that depend on newer entity attributes simply do not render. They do not error.

If you are on integration 3.3.0 or later, use the current tiles. The **Away** button changed behaviour in 3.3.0: it now sends a validated arm which the panel refuses if an input is unsealed. Older tiles have no way to force arm.

---

# Installation

## HACS (recommended)

1. In Home Assistant, open **HACS**.
2. Select the three-dot menu, then **Custom repositories**.
3. Add:

```
https://github.com/josh2893/TecomHA-Tiles-and-Addons
```

   with the type set to **Dashboard**.

4. Find **TecomHA Tiles and Addons** in the list and select **Download**.
5. Restart Home Assistant, or reload the browser with a hard refresh.

HACS registers the Lovelace resource for you and will notify you when a new version is released. No manual resource entry is required.

The resource HACS creates points at:

```
/hacsfiles/TecomHA-Tiles-and-Addons/TecomHA-Tiles-and-Addons.js
```

## Manual installation

If you prefer not to use HACS:

1. Download `TecomHA-Tiles-and-Addons.js` from the `dist` folder of this repository, or from a release.
2. Copy it into the Home Assistant `www` directory:

```
/config/www/TecomHA-Tiles-and-Addons.js
```

   Create `www` if it does not exist. You can copy the file using Studio Code Server, File Editor, Samba, SSH/SFTP, or any other file management method.

   Home Assistant serves files in `/config/www/` under the `/local/` URL path, so the file above is reached as `/local/TecomHA-Tiles-and-Addons.js`.

3. Go to **Settings → Dashboards → Resources**, select **Add Resource**, and enter:

```
/local/TecomHA-Tiles-and-Addons.js
```

   Set the resource type to **JavaScript Module** and save.

   > The Resources menu is only visible when **Advanced Mode** is enabled on your Home Assistant user profile.

4. Refresh Home Assistant. If the tiles do not appear, perform a hard browser refresh or clear the frontend cache.

---

# Adding Tiles to a Dashboard

Open the dashboard and select **Edit Dashboard → Add Card → Manual**, then paste the required YAML.

---

## Included Tiles

### Alarm Tile

```yaml
type: custom:tecom-alarm-tile
entity: alarm_control_panel.area_1
name: House Alarm
```

Provides a compact alarm control tile for a Home Assistant `alarm_control_panel` entity.

#### Arm, Force Arm and Disarm

The panel has two distinct arm actions, and the tile exposes both:

| Button | Behaviour |
|---|---|
| Home | Stay arm |
| Away | Validated arm — the panel refuses this if any input is unsealed |
| Force | Arms regardless of unsealed inputs |
| Disarm | |

The **Force** chip only appears when the entity advertises custom bypass support, so it stays hidden on integration versions or entities that do not support it.

```yaml
type: custom:tecom-alarm-tile
entity: alarm_control_panel.area_1
name: Area 1
arm_home_label: Stay
arm_away_label: Away
force_arm_label: Force
disarm_label: Disarm
show_force_arm: true
```

#### Refused arms

When the panel refuses an arm because an input is unsealed, the tile shows the reason for a few seconds rather than appearing to do nothing:

```
Arm refused: Rear Entry Contact unsealed
```

This requires integration 3.3.0 or later, which reports the offending input.

```yaml
refusal_message_seconds: 8
```

#### Triggered areas

When an area is in alarm, the tile lists the points that tripped it rather than showing only "Triggered".

---

### Door Tile

```yaml
type: custom:tecom-door-tile
entity: lock.front_door
name: Front Door
```

Provides door control using a Home Assistant `lock` entity.

#### Reed / contact state

A separate reed/contact sensor can be assigned so the tile displays the **true physical door state** rather than relying only on the lock state:

```yaml
type: custom:tecom-door-tile
entity: lock.front_door
reed_entity: binary_sensor.front_door_contact
name: Front Door
confirm_open: true
```

When `reed_entity` is configured, `on` = Door Open and `off` = Door Closed.

This matters because a door can be unlocked while still physically closed, or still open after the lock output has returned to its secure state.

#### Open, Lock and Unlock

**Open** is a momentary release and does not change the lock mode. It is the safe default for a dashboard button.

**Lock** and **Unlock** latch the door until changed. These are hidden by default; enable them explicitly:

```yaml
type: custom:tecom-door-tile
entity: lock.front_entry
name: Front Entry
show_lock_buttons: true
confirm_unlock: true
confirm_unlock_message: Unlock Front Entry? It will stay unlocked until locked again.
```

The chip shown reflects the current state — **Unlock** when locked, **Lock** when unlocked.

#### Last access

The tile can show who last came through, using the door's access event entity:

```yaml
type: custom:tecom-door-tile
entity: lock.front_entry
reed_entity: binary_sensor.front_entry_door_contact
access_entity: event.front_entry_access
name: Front Entry
```

Example display:

```
Access: Secure • Reed: Closed • Last: J. Smith (3m ago)
```

The line adapts to what the event was:

| Event | Shown as |
|---|---|
| Card granted, user known | the user's name |
| Card granted, names not synced | `User 2307` |
| Panel opened the door itself | `System` |
| Exit button | `Exit button` |
| Door forced | `Forced` |
| Open too long | `Open too long` |

`System` appears when the panel opened the door rather than a credential being presented — a macro or interlock, for example.

User names require the integration's user name sync to be enabled; without it the line falls back to the user number. Nothing is shown until the entity has fired at least once.

| Option | Default |
|---|---|
| `access_entity` | — |
| `show_last_access` | `true` |
| `last_access_label` | `Last` |
| `system_user_label` | `System` |
| `egress_label` | `Exit button` |
| `forced_label` | `Forced` |
| `too_long_label` | `Open too long` |

---

### Relay Tile

```yaml
type: custom:tecom-relay-tile
entity: switch.relay_1
name: External Lighting
```

Provides a tile for a relay/output exposed to Home Assistant.

A timezone or schedule entity can be linked so the tile shows whether the associated schedule is currently active:

```yaml
type: custom:tecom-relay-tile
entity: switch.relay_1
name: External Lighting
timezone_entity: binary_sensor.external_lighting_timezone
timezone_label: Timezone
```

---

# Timezone / Schedule Status

A timezone or schedule entity can optionally be assigned to supported tiles. This is useful where a Tecom timezone or schedule controls relays, lighting, gates, HVAC, door access periods, after-hours functions, or other automated outputs.

## Relay with Timezone Status

```yaml
type: custom:tecom-relay-tile
entity: switch.relay_1
name: Car Park Lighting
timezone_entity: binary_sensor.car_park_lighting_timezone
timezone_label: Timezone
```

Example display:

```
Car Park Lighting
Relay: ON
Timezone: Running
```

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

A single tile can then display door control state, physical reed/contact state, and the current timezone/schedule state.

## Home Assistant Schedule Entity

The timezone status does not have to come from Tecom. A Home Assistant `schedule` entity works too:

```yaml
type: custom:tecom-relay-tile
entity: switch.relay_5
name: External Lighting
timezone_entity: schedule.external_lighting
timezone_label: Schedule
```

## Custom Timezone States

If the entity uses a particular active state, specify it manually:

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

Available timezone options:

```yaml
timezone_entity:
timezone_label:
timezone_active_state:
timezone_active_label:
timezone_inactive_label:
```

---

# Example Dashboard Layout

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
    access_entity: event.front_entry_access
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

For doors, it is recommended to confirm before sending a release command:

```yaml
confirm_open: true
confirm_open_message: Release Front Entry?
```

This helps prevent accidental door releases from a dashboard. A separate confirmation is available for unlocking, which latches the door open:

```yaml
confirm_unlock: true
```

---

# Changing Button Labels

Labels can be customised to suit the terminology used at your site.

Alarm example:

```yaml
type: custom:tecom-alarm-tile
entity: alarm_control_panel.area_1
name: Administration
arm_home_label: Stay
arm_away_label: Arm
force_arm_label: Force
disarm_label: Disarm
```

Door example:

```yaml
type: custom:tecom-door-tile
entity: lock.front_entry
name: Front Entry
open_label: Release
lock_label: Secure
unlock_label: Free Access
confirm_open: true
```

---

# Updating the Tiles

## Via HACS

HACS notifies you when a new release is available. Select **Update**, then hard-refresh the browser.

## Manually

1. Download the new `TecomHA-Tiles-and-Addons.js`.
2. Replace the existing file in `/config/www/`.
3. Hard-refresh the browser.

You do not need to re-add the Lovelace resource if the filename and path are unchanged.

---

# Troubleshooting

## Custom Element Doesn't Exist

If Home Assistant shows:

```
Custom element doesn't exist: tecom-door-tile
```

Check that the resource is registered and points at the right path, then hard-refresh.

- HACS install: `/hacsfiles/TecomHA-Tiles-and-Addons/TecomHA-Tiles-and-Addons.js`
- Manual install: `/local/TecomHA-Tiles-and-Addons.js`

The resource type must be **JavaScript Module**.

## Tile Displays Entity Not Found

Check that the entity ID in the YAML exactly matches the entity shown under **Settings → Devices & Services → Entities**.

## The Force Button Is Missing

The Force chip only renders when the entity advertises custom bypass support. Confirm you are on integration 3.3.0 or later, and check `supported_features` on the alarm entity under **Developer Tools → States**.

## Last Access Shows a Number Instead of a Name

User name sync is off by default in the integration. Enable it under **Settings → Devices & Services → Tecom ChallengerPlus → Configure → Sync user names from panel**, then run the **Sync Users Now** button.

## Last Access Shows "System"

The panel opened the door rather than a credential being presented — commonly a macro or interlock. This is correct behaviour, not a fault.

## Reed Switch State Is Incorrect

Check the reed entity under **Developer Tools → States**. Expected states are `on` = Open and `off` = Closed.

## Timezone Always Shows Inactive

Inspect the entity assigned to `timezone_entity` under **Developer Tools → States** and check its exact state while the timezone is active. If required, set it explicitly:

```yaml
timezone_active_state: running
```

## Changes Are Not Appearing

Browsers cache JavaScript aggressively. Try a hard refresh, closing and reopening the mobile app, or clearing the browser cache.

For manual installs, a version suffix on the resource URL forces a fresh copy:

```
/local/TecomHA-Tiles-and-Addons.js?v=3
```

HACS handles this automatically by appending its own version tag.

---

# Notes

These tiles provide a frontend interface only. The controls and states available depend on the entities exposed by the Tecom ChallengerPlus integration:

- Alarm controls require an `alarm_control_panel` entity
- Door controls require a `lock` entity
- Physical door state requires a reed/contact `binary_sensor`
- Last access requires the door's `event` entity
- Relay controls require a `switch` entity
- Timezone display requires an entity representing whether the schedule is active

Always confirm the underlying entity operates correctly before relying on the tile.

---

## Tecom ChallengerPlus Home Assistant Integration

For integration installation, configuration, supported entities, troubleshooting and releases, see the [main project repository](https://github.com/josh2893/TecomHA).
