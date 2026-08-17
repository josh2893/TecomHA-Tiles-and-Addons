
class TecomTileBase extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  setConfig(config) {
    if (!config || !config.entity) {
      throw new Error('Entity is required');
    }
    this._config = config;
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
    this._render();
  }

  getCardSize() {
    return 3;
  }

  _fireMoreInfo(entityId) {
    const event = new Event('hass-more-info', { bubbles: true, composed: true });
    event.detail = { entityId };
    this.dispatchEvent(event);
  }

  _callService(domain, service, data) {
    if (!this._hass) return;
    this._hass.callService(domain, service, data);
  }

  _computeName(stateObj, fallback) {
    return this._config?.name || stateObj?.attributes?.friendly_name || fallback || 'Tecom Tile';
  }

  _formatEntityState(state) {
    if (!state) return 'Unknown';
    return String(state)
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (m) => m.toUpperCase());
  }

  _isUnavailable(stateObj) {
    return !stateObj || ['unavailable', 'unknown'].includes(stateObj.state);
  }

  _iconHtml(icon) {
    return `<ha-icon icon="${icon}"></ha-icon>`;
  }

  _entityIsActive(stateObj, activeState) {
    if (!stateObj) return false;
    const state = String(stateObj.state ?? '').toLowerCase();

    if (Array.isArray(activeState)) {
      return activeState.map((v) => String(v).toLowerCase()).includes(state);
    }

    if (activeState !== undefined && activeState !== null) {
      return state === String(activeState).toLowerCase();
    }

    return ['on', 'active', 'running', 'armed', 'open', 'unlocked'].includes(state);
  }

  _buildScheduleMeta(scheduleObj, config = {}) {
    if (!scheduleObj) {
      return {
        hasEntity: false,
        active: false,
        label: config.inactive_label || 'Not running',
        accent: 'bad',
        pillPrefix: config.label || 'Timezone',
      };
    }

    const active = this._entityIsActive(scheduleObj, config.active_state);
    return {
      hasEntity: true,
      active,
      label: active ? (config.active_label || 'Running') : (config.inactive_label || 'Not running'),
      accent: active ? 'good' : 'bad',
      pillPrefix: config.label || 'Timezone',
      entityId: scheduleObj.entity_id,
      rawState: scheduleObj.state,
    };
  }

  _renderCard({ icon, name, primary, secondary = '', footer = '', unavailable = false, onCardClick }) {
    const card = `
      <ha-card class="tile ${unavailable ? 'is-unavailable' : ''}">
        <div class="wrap" id="card-root">
          <div class="top-row">
            <div class="icon-wrap">${this._iconHtml(icon)}</div>
            <div class="title-wrap">
              <div class="name">${name}</div>
              <div class="primary">${primary}</div>
              ${secondary ? `<div class="secondary">${secondary}</div>` : ''}
            </div>
          </div>
          ${footer ? `<div class="footer">${footer}</div>` : ''}
        </div>
      </ha-card>
      <style>
        :host {
          display: block;
        }
        ha-card.tile {
          border-radius: var(--ha-card-border-radius, 16px);
          overflow: hidden;
        }
        .wrap {
          display: flex;
          flex-direction: column;
          gap: 14px;
          padding: 16px;
          cursor: pointer;
          min-height: 132px;
          background:
            radial-gradient(circle at top right, rgba(var(--rgb-primary-color), 0.12), transparent 36%),
            linear-gradient(180deg, rgba(var(--rgb-card-background-color), 0.96), rgba(var(--rgb-card-background-color), 1));
        }
        .top-row {
          display: grid;
          grid-template-columns: 52px 1fr;
          gap: 14px;
          align-items: center;
        }
        .icon-wrap {
          width: 52px;
          height: 52px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--primary-color);
          background: rgba(var(--rgb-primary-color), 0.14);
        }
        ha-icon {
          width: 28px;
          height: 28px;
        }
        .name {
          font-size: 0.95rem;
          line-height: 1.2;
          color: var(--secondary-text-color);
          margin-bottom: 4px;
          font-weight: 500;
        }
        .primary {
          font-size: 1.25rem;
          line-height: 1.2;
          font-weight: 700;
          color: var(--primary-text-color);
        }
        .secondary {
          margin-top: 6px;
          font-size: 0.88rem;
          color: var(--secondary-text-color);
        }
        .footer {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        button.chip,
        .pill {
          border: none;
          border-radius: 999px;
          padding: 8px 12px;
          font: inherit;
          font-size: 0.84rem;
          font-weight: 600;
          line-height: 1;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          min-height: 34px;
          color: var(--primary-text-color);
          background: rgba(var(--rgb-primary-text-color), 0.08);
        }
        button.chip {
          cursor: pointer;
          transition: transform 0.12s ease, background 0.12s ease;
        }
        button.chip:hover {
          transform: translateY(-1px);
          background: rgba(var(--rgb-primary-color), 0.14);
        }
        button.chip:active {
          transform: translateY(0);
        }
        button.chip.primary {
          color: var(--text-primary-color, var(--primary-text-color));
          background: var(--primary-color);
        }
        button.chip.warn {
          background: rgba(var(--rgb-warning-color), 0.18);
          color: var(--warning-color);
        }
        .pill.good {
          background: rgba(var(--rgb-state-lock-locked-color, var(--rgb-success-color, 33, 150, 83)), 0.16);
          color: var(--state-lock-locked-color, var(--success-color, #2e7d32));
        }
        .pill.bad {
          background: rgba(var(--rgb-state-lock-unlocked-color, var(--rgb-warning-color)), 0.16);
          color: var(--state-lock-unlocked-color, var(--warning-color));
        }
        .pill.alert {
          background: rgba(var(--rgb-error-color), 0.16);
          color: var(--error-color);
        }
        .is-unavailable .icon-wrap,
        .is-unavailable .pill,
        .is-unavailable button.chip {
          opacity: 0.68;
        }
      </style>
    `;

    this.shadowRoot.innerHTML = card;

    const root = this.shadowRoot.getElementById('card-root');
    if (root && typeof onCardClick === 'function') {
      root.addEventListener('click', onCardClick);
    }
  }
}

class TecomAlarmTile extends TecomTileBase {
  static getStubConfig() {
    return {
      entity: 'alarm_control_panel.example_alarm',
      name: 'Alarm',
    };
  }

  _alarmMeta(stateObj) {
    const state = stateObj?.state;
    switch (state) {
      case 'armed_away':
        return { icon: 'mdi:shield-lock', label: 'Armed Away', accent: 'good' };
      case 'armed_home':
        return { icon: 'mdi:shield-home', label: 'Armed Home', accent: 'good' };
      case 'triggered':
        return { icon: 'mdi:shield-alert', label: 'Triggered', accent: 'alert' };
      case 'pending':
        return { icon: 'mdi:shield-outline', label: 'Pending', accent: 'bad' };
      case 'arming':
        return { icon: 'mdi:shield-sync', label: 'Arming', accent: 'bad' };
      case 'disarmed':
        return { icon: 'mdi:shield-off-outline', label: 'Disarmed', accent: 'bad' };
      case 'unavailable':
      case 'unknown':
      default:
        return { icon: 'mdi:shield-question', label: this._formatEntityState(state), accent: 'bad' };
    }
  }

  _render() {
    if (!this._config) return;

    const stateObj = this._hass?.states?.[this._config.entity];
    const unavailable = this._isUnavailable(stateObj);
    const meta = this._alarmMeta(stateObj);
    const name = this._computeName(stateObj, 'Alarm');
    const showButtons = this._config.show_buttons !== false;

    const secondary = unavailable
      ? 'Entity unavailable'
      : (this._config.subtitle || 'Tap for more info');

    let footer = `<span class="pill ${meta.accent}">${meta.label}</span>`;

    if (!unavailable && showButtons) {
      const buttons = [];
      buttons.push(`<button type="button" class="chip" data-action="arm_home">${this._config.arm_home_label || 'Home'}</button>`);
      buttons.push(`<button type="button" class="chip" data-action="arm_away">${this._config.arm_away_label || 'Away'}</button>`);
      buttons.push(`<button type="button" class="chip warn" data-action="disarm">${this._config.disarm_label || 'Disarm'}</button>`);
      footer += buttons.join('');
    }

    this._renderCard({
      icon: this._config.icon || meta.icon,
      name,
      primary: meta.label,
      secondary,
      footer,
      unavailable,
      onCardClick: () => this._fireMoreInfo(this._config.entity),
    });

    this.shadowRoot.querySelectorAll('button[data-action]').forEach((btn) => {
      btn.addEventListener('click', (ev) => {
        ev.stopPropagation();
        const action = btn.dataset.action;
        if (action === 'arm_home') {
          this._callService('alarm_control_panel', 'alarm_arm_home', { entity_id: this._config.entity });
        } else if (action === 'arm_away') {
          this._callService('alarm_control_panel', 'alarm_arm_away', { entity_id: this._config.entity });
        } else if (action === 'disarm') {
          this._callService('alarm_control_panel', 'alarm_disarm', { entity_id: this._config.entity });
        }
      });
    });
  }
}

class TecomDoorTile extends TecomTileBase {
  static getStubConfig() {
    return {
      entity: 'lock.example_door',
      name: 'Door',
      reed_entity: 'binary_sensor.example_door_contact',
    };
  }

  _doorMeta(lockObj, reedObj) {
    const lockState = lockObj?.state;
    const reedState = reedObj?.state;
    const hasReed = !!reedObj;
    const reedOpen = reedState === 'on';
    const reedClosed = reedState === 'off';

    let icon = 'mdi:door-closed-lock';
    let primary = 'Secure';
    let primaryAccent = 'good';

    if (hasReed) {
      if (reedOpen) {
        icon = 'mdi:door-open';
        primary = 'Open';
        primaryAccent = 'bad';
      } else if (reedClosed) {
        icon = lockState === 'unlocked' ? 'mdi:door-closed' : 'mdi:door-closed-lock';
        primary = 'Closed';
        primaryAccent = 'good';
      } else {
        primary = 'Contact Unknown';
        primaryAccent = 'bad';
        icon = 'mdi:door';
      }
    } else {
      switch (lockState) {
        case 'locked':
          icon = 'mdi:door-closed-lock';
          primary = 'Secure';
          primaryAccent = 'good';
          break;
        case 'unlocked':
          icon = 'mdi:door-open';
          primary = 'Released';
          primaryAccent = 'bad';
          break;
        case 'locking':
          icon = 'mdi:door';
          primary = 'Securing';
          primaryAccent = 'bad';
          break;
        case 'unlocking':
          icon = 'mdi:door';
          primary = 'Releasing';
          primaryAccent = 'bad';
          break;
        default:
          icon = 'mdi:door';
          primary = this._formatEntityState(lockState);
          primaryAccent = 'bad';
          break;
      }
    }

    let accessLabel = 'Access Unknown';
    let accessAccent = 'bad';
    if (lockState === 'locked') {
      accessLabel = 'Secure';
      accessAccent = 'good';
    } else if (lockState === 'unlocked') {
      accessLabel = 'Released';
      accessAccent = 'bad';
    } else if (lockState === 'locking') {
      accessLabel = 'Securing';
      accessAccent = 'bad';
    } else if (lockState === 'unlocking') {
      accessLabel = 'Releasing';
      accessAccent = 'bad';
    }

    let contactLabel = '';
    let contactAccent = 'bad';
    if (hasReed) {
      if (reedOpen) {
        contactLabel = 'Open';
        contactAccent = 'bad';
      } else if (reedClosed) {
        contactLabel = 'Closed';
        contactAccent = 'good';
      } else {
        contactLabel = 'Contact Unknown';
        contactAccent = 'bad';
      }
    }

    return {
      icon,
      primary,
      primaryAccent,
      accessLabel,
      accessAccent,
      contactLabel,
      contactAccent,
      hasReed,
    };
  }

  _supportsOpen(lockObj) {
    const features = Number(lockObj?.attributes?.supported_features || 0);
    return (features & 1) === 1;
  }

  _render() {
    if (!this._config) return;

    const lockObj = this._hass?.states?.[this._config.entity];
    const reedObj = this._config.reed_entity ? this._hass?.states?.[this._config.reed_entity] : null;
    const timezoneObj = this._config.timezone_entity ? this._hass?.states?.[this._config.timezone_entity] : null;
    const timezoneMeta = this._buildScheduleMeta(timezoneObj, {
      active_state: this._config.timezone_active_state,
      active_label: this._config.timezone_active_label || 'Running',
      inactive_label: this._config.timezone_inactive_label || 'Not running',
      label: this._config.timezone_label || 'Timezone',
    });
    const unavailable = this._isUnavailable(lockObj);
    const meta = this._doorMeta(lockObj, reedObj);
    const name = this._computeName(lockObj, 'Door');
    const showButton = this._config.show_open_button !== false;
    const openLabel = this._config.open_label || 'Open';
    const secondaryParts = [];

    if (unavailable) {
      secondaryParts.push('Entity unavailable');
    } else if (this._config.reed_entity) {
      secondaryParts.push(`Access: ${meta.accessLabel}`);
      secondaryParts.push(`Reed: ${meta.contactLabel}`);
    } else {
      secondaryParts.push(`Access: ${meta.accessLabel}`);
    }

    if (this._config.timezone_entity) {
      secondaryParts.push(`${timezoneMeta.pillPrefix}: ${timezoneMeta.label}`);
    }

    let footer = '';
    if (this._config.reed_entity) {
      footer += `<span class="pill ${meta.contactAccent}">Reed ${meta.contactLabel}</span>`;
    }
    footer += `<span class="pill ${meta.accessAccent}">Door ${meta.accessLabel}</span>`;
    if (this._config.timezone_entity) {
      footer += `<span class="pill ${timezoneMeta.accent}">${timezoneMeta.pillPrefix} ${timezoneMeta.label}</span>`;
    }
    if (!unavailable && showButton) {
      footer += `<button type="button" class="chip primary" data-action="open">${openLabel}</button>`;
    }

    this._renderCard({
      icon: this._config.icon || meta.icon,
      name,
      primary: meta.primary,
      secondary: secondaryParts.join(' • '),
      footer,
      unavailable,
      onCardClick: () => this._fireMoreInfo(this._config.entity),
    });

    this.shadowRoot.querySelectorAll('button[data-action="open"]').forEach((btn) => {
      btn.addEventListener('click', (ev) => {
        ev.stopPropagation();
        if (this._config.confirm_open) {
          const ok = window.confirm(this._config.confirm_open_message || `Open ${name}?`);
          if (!ok) return;
        }
        if (this._supportsOpen(lockObj)) {
          this._callService('lock', 'open', { entity_id: this._config.entity });
        } else {
          this._callService('lock', 'unlock', { entity_id: this._config.entity });
        }
      });
    });
  }
}

class TecomRelayTile extends TecomTileBase {
  static getStubConfig() {
    return {
      entity: 'switch.example_relay',
      name: 'Relay',
      timezone_entity: 'binary_sensor.example_timezone_running',
    };
  }

  _relayMeta(relayObj) {
    const state = relayObj?.state;
    switch (state) {
      case 'on':
        return { icon: 'mdi:toggle-switch', label: 'On', accent: 'good' };
      case 'off':
        return { icon: 'mdi:toggle-switch-off-outline', label: 'Off', accent: 'bad' };
      default:
        return { icon: 'mdi:electric-switch', label: this._formatEntityState(state), accent: 'bad' };
    }
  }

  _render() {
    if (!this._config) return;

    const relayObj = this._hass?.states?.[this._config.entity];
    const timezoneObj = this._config.timezone_entity ? this._hass?.states?.[this._config.timezone_entity] : null;
    const timezoneMeta = this._buildScheduleMeta(timezoneObj, {
      active_state: this._config.timezone_active_state,
      active_label: this._config.timezone_active_label || 'Running',
      inactive_label: this._config.timezone_inactive_label || 'Not running',
      label: this._config.timezone_label || 'Timezone',
    });
    const unavailable = this._isUnavailable(relayObj);
    const meta = this._relayMeta(relayObj);
    const name = this._computeName(relayObj, 'Relay');
    const showToggle = this._config.show_toggle_button !== false;
    const secondaryParts = [];

    if (unavailable) {
      secondaryParts.push('Entity unavailable');
    } else {
      secondaryParts.push(`Relay: ${meta.label}`);
    }

    if (this._config.timezone_entity) {
      secondaryParts.push(`${timezoneMeta.pillPrefix}: ${timezoneMeta.label}`);
    }

    let footer = `<span class="pill ${meta.accent}">Relay ${meta.label}</span>`;
    if (this._config.timezone_entity) {
      footer += `<span class="pill ${timezoneMeta.accent}">${timezoneMeta.pillPrefix} ${timezoneMeta.label}</span>`;
    }

    if (!unavailable && showToggle) {
      if (relayObj?.state === 'on') {
        footer += `<button type="button" class="chip warn" data-action="turn_off">${this._config.off_label || 'Turn Off'}</button>`;
      } else {
        footer += `<button type="button" class="chip primary" data-action="turn_on">${this._config.on_label || 'Turn On'}</button>`;
      }
    }

    this._renderCard({
      icon: this._config.icon || meta.icon,
      name,
      primary: meta.label,
      secondary: secondaryParts.join(' • '),
      footer,
      unavailable,
      onCardClick: () => this._fireMoreInfo(this._config.entity),
    });

    this.shadowRoot.querySelectorAll('button[data-action]').forEach((btn) => {
      btn.addEventListener('click', (ev) => {
        ev.stopPropagation();
        const action = btn.dataset.action;
        if (action === 'turn_on') {
          this._callService('switch', 'turn_on', { entity_id: this._config.entity });
        } else if (action === 'turn_off') {
          this._callService('switch', 'turn_off', { entity_id: this._config.entity });
        }
      });
    });
  }
}

if (!customElements.get('tecom-alarm-tile')) {
  customElements.define('tecom-alarm-tile', TecomAlarmTile);
}

if (!customElements.get('tecom-door-tile')) {
  customElements.define('tecom-door-tile', TecomDoorTile);
}

if (!customElements.get('tecom-relay-tile')) {
  customElements.define('tecom-relay-tile', TecomRelayTile);
}

window.customCards = window.customCards || [];
window.customCards.push({
  type: 'tecom-alarm-tile',
  name: 'Tecom Alarm Tile',
  description: 'Alarm tile for Tecom Challenger / Home Assistant alarm_control_panel entities',
});
window.customCards.push({
  type: 'tecom-door-tile',
  name: 'Tecom Door Tile',
  description: 'Door tile for Tecom Challenger / Home Assistant lock entities with optional reed contact and timezone status',
});
window.customCards.push({
  type: 'tecom-relay-tile',
  name: 'Tecom Relay Tile',
  description: 'Relay tile for Tecom Challenger / Home Assistant switch entities with optional timezone status',
});
