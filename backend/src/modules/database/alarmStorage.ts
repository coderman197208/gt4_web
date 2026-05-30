import prisma from './prismaClient.js';

const alarmSchemaStatements = [
  `
  CREATE TABLE IF NOT EXISTS alarm_area (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    area_code VARCHAR(64) NOT NULL UNIQUE,
    area_name VARCHAR(128) NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )
  `,
  `
  CREATE TABLE IF NOT EXISTS user_area (
    user_id INT NOT NULL,
    area_id INT NOT NULL REFERENCES alarm_area(id) ON DELETE CASCADE,
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, area_id)
  )
  `,
  `
  CREATE UNIQUE INDEX IF NOT EXISTS uq_user_area_default
    ON user_area (user_id)
    WHERE is_default = TRUE
  `,
  `
  CREATE TABLE IF NOT EXISTS alarm_definition (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    alarm_code VARCHAR(64) NOT NULL UNIQUE,
    alarm_name VARCHAR(128) NOT NULL,
    severity VARCHAR(16) NOT NULL CHECK (severity IN ('critical', 'major', 'minor', 'warning', 'info')),
    source_module VARCHAR(64) NOT NULL,
    default_area_id INT NULL REFERENCES alarm_area(id),
    confirm_required BOOLEAN NOT NULL DEFAULT TRUE,
    auto_clear BOOLEAN NOT NULL DEFAULT FALSE,
    dedupe_strategy VARCHAR(32) NOT NULL DEFAULT 'by_dedupe_key'
      CHECK (dedupe_strategy IN ('by_dedupe_key', 'by_alarm_code_and_source')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )
  `,
  `
  CREATE TABLE IF NOT EXISTS alarm_event (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    definition_id INT NULL REFERENCES alarm_definition(id),
    alarm_code VARCHAR(64) NOT NULL,
    area_id INT NOT NULL REFERENCES alarm_area(id),
    source_module VARCHAR(64) NOT NULL,
    source_key VARCHAR(128) NOT NULL,
    severity VARCHAR(16) NOT NULL CHECK (severity IN ('critical', 'major', 'minor', 'warning', 'info')),
    title VARCHAR(256) NOT NULL,
    message TEXT NOT NULL,
    detail_json JSONB NOT NULL DEFAULT '{}'::JSONB,
    condition_state VARCHAR(16) NOT NULL CHECK (condition_state IN ('active', 'cleared')),
    ack_state VARCHAR(16) NOT NULL CHECK (ack_state IN ('unacked', 'acked')),
    first_occurred_at TIMESTAMPTZ NOT NULL,
    last_occurred_at TIMESTAMPTZ NOT NULL,
    cleared_at TIMESTAMPTZ NULL,
    acked_at TIMESTAMPTZ NULL,
    acked_by_user_id INT NULL,
    acked_by_name VARCHAR(64) NULL,
    dedupe_key VARCHAR(256) NOT NULL,
    reopen_count INTEGER NOT NULL DEFAULT 0,
    version INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (
      (condition_state = 'active' AND cleared_at IS NULL)
      OR (condition_state = 'cleared' AND cleared_at IS NOT NULL)
    )
  )
  `,
  `
  CREATE UNIQUE INDEX IF NOT EXISTS uq_alarm_event_active_dedupe
    ON alarm_event (dedupe_key)
    WHERE condition_state = 'active'
  `,
  `
  CREATE INDEX IF NOT EXISTS idx_alarm_event_active_query
    ON alarm_event (area_id, ack_state, severity, last_occurred_at DESC)
    WHERE condition_state = 'active'
  `,
  `
  CREATE INDEX IF NOT EXISTS idx_alarm_event_history_query
    ON alarm_event (area_id, last_occurred_at DESC)
  `,
  `
  CREATE INDEX IF NOT EXISTS idx_alarm_event_code_source
    ON alarm_event (alarm_code, source_module, source_key)
  `,
  `
  CREATE TABLE IF NOT EXISTS alarm_event_log (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    alarm_event_id INT NOT NULL REFERENCES alarm_event(id) ON DELETE CASCADE,
    action VARCHAR(16) NOT NULL CHECK (action IN ('raise', 'clear', 'ack')),
    operator_type VARCHAR(16) NOT NULL CHECK (operator_type IN ('system', 'user')),
    operator_id INT NULL,
    operator_name VARCHAR(64) NULL,
    payload_json JSONB NOT NULL DEFAULT '{}'::JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )
  `,
  `
  CREATE INDEX IF NOT EXISTS idx_alarm_event_log_event_time
    ON alarm_event_log (alarm_event_id, created_at DESC)
  `,
];

const alarmSeedStatements = [
  `
  INSERT INTO alarm_area (area_code, area_name, sort_order, enabled)
  VALUES
    ('AREA-A', 'A区', 10, TRUE),
    ('AREA-B', 'B区', 20, TRUE),
    ('AREA-C', '公共区', 30, TRUE)
  ON CONFLICT (area_code) DO UPDATE
  SET
    area_name = EXCLUDED.area_name,
    sort_order = EXCLUDED.sort_order,
    enabled = EXCLUDED.enabled,
    updated_at = NOW()
  `,
  `
  INSERT INTO user_area (user_id, area_id, is_default)
  SELECT 1, area.id, area.area_code = 'AREA-A'
  FROM alarm_area AS area
  WHERE area.area_code IN ('AREA-A', 'AREA-B', 'AREA-C')
    AND NOT EXISTS (
      SELECT 1 FROM user_area existing WHERE existing.user_id = 1
    )
  `,
  `
  INSERT INTO user_area (user_id, area_id, is_default)
  SELECT 2, area.id, TRUE
  FROM alarm_area AS area
  WHERE area.area_code = 'AREA-A'
    AND NOT EXISTS (
      SELECT 1 FROM user_area existing WHERE existing.user_id = 2
    )
  `,
  `
  INSERT INTO user_area (user_id, area_id, is_default)
  SELECT 3, area.id, TRUE
  FROM alarm_area AS area
  WHERE area.area_code = 'AREA-B'
    AND NOT EXISTS (
      SELECT 1 FROM user_area existing WHERE existing.user_id = 3
    )
  `,
  `
  INSERT INTO alarm_definition (
    alarm_code,
    alarm_name,
    severity,
    source_module,
    default_area_id,
    confirm_required,
    auto_clear,
    dedupe_strategy
  )
  SELECT
    'SPRAY_PRESS_LOW',
    '喷码压力过低',
    'critical',
    'SprayWeight',
    area.id,
    TRUE,
    FALSE,
    'by_dedupe_key'
  FROM alarm_area AS area
  WHERE area.area_code = 'AREA-A'
  ON CONFLICT (alarm_code) DO UPDATE
  SET
    alarm_name = EXCLUDED.alarm_name,
    severity = EXCLUDED.severity,
    source_module = EXCLUDED.source_module,
    default_area_id = EXCLUDED.default_area_id,
    confirm_required = EXCLUDED.confirm_required,
    auto_clear = EXCLUDED.auto_clear,
    dedupe_strategy = EXCLUDED.dedupe_strategy,
    updated_at = NOW()
  `,
  `
  INSERT INTO alarm_definition (
    alarm_code,
    alarm_name,
    severity,
    source_module,
    default_area_id,
    confirm_required,
    auto_clear,
    dedupe_strategy
  )
  SELECT
    'TAG_PRINT_OFFLINE',
    '标签打印机离线',
    'major',
    'TagPrint',
    area.id,
    TRUE,
    FALSE,
    'by_dedupe_key'
  FROM alarm_area AS area
  WHERE area.area_code = 'AREA-B'
  ON CONFLICT (alarm_code) DO UPDATE
  SET
    alarm_name = EXCLUDED.alarm_name,
    severity = EXCLUDED.severity,
    source_module = EXCLUDED.source_module,
    default_area_id = EXCLUDED.default_area_id,
    confirm_required = EXCLUDED.confirm_required,
    auto_clear = EXCLUDED.auto_clear,
    dedupe_strategy = EXCLUDED.dedupe_strategy,
    updated_at = NOW()
  `,
  `
  INSERT INTO alarm_definition (
    alarm_code,
    alarm_name,
    severity,
    source_module,
    default_area_id,
    confirm_required,
    auto_clear,
    dedupe_strategy
  )
  SELECT
    'PLC_HEARTBEAT_LOSS',
    'PLC 心跳丢失',
    'critical',
    'MonitorPlcData',
    area.id,
    TRUE,
    FALSE,
    'by_alarm_code_and_source'
  FROM alarm_area AS area
  WHERE area.area_code = 'AREA-C'
  ON CONFLICT (alarm_code) DO UPDATE
  SET
    alarm_name = EXCLUDED.alarm_name,
    severity = EXCLUDED.severity,
    source_module = EXCLUDED.source_module,
    default_area_id = EXCLUDED.default_area_id,
    confirm_required = EXCLUDED.confirm_required,
    auto_clear = EXCLUDED.auto_clear,
    dedupe_strategy = EXCLUDED.dedupe_strategy,
    updated_at = NOW()
  `,
];

async function executeStatements(statements: string[], phase: 'schema' | 'seed') {
  for (let index = 0; index < statements.length; index += 1) {
    try {
      await prisma.$executeRawUnsafe(statements[index]);
    } catch (error) {
      console.error(
        `[AlarmStorage] Failed to apply ${phase} statement ${index + 1}/${statements.length}`,
      );
      throw error;
    }
  }
}

export async function bootstrapAlarmStorage() {
  await executeStatements(alarmSchemaStatements, 'schema');
  await executeStatements(alarmSeedStatements, 'seed');
}
