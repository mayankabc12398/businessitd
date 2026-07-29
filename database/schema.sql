-- ============================================================================
-- Smart HIMS PMO — Relational Schema (MySQL 8)
-- Source: React app static data in src/data/* (see README.md for table→file map)
-- Runnable top-to-bottom (parents first). Engine InnoDB, charset utf8mb4.
--
-- Normalization notes:
--   * Cross-cutting dimensions (severity, health, statuses, categories, roles,
--     countries, modules, departments, milestones …) are LOOKUP tables.
--   * Entity-local status vocabularies (e.g. bug status, uat status) are held as
--     VARCHAR + CHECK(... IN ...) — a deliberate boundary to avoid ~20 tiny
--     tables; documented in README "Assumptions".
--   * Denormalized mirror columns in the source (projectName, integrationName,
--     featureName …) are dropped; derive via JOIN.
-- ============================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 1;
SET sql_mode = 'STRICT_ALL_TABLES,NO_ENGINE_SUBSTITUTION';

-- ============================================================================
-- 1. LOOKUP TABLES
-- ============================================================================

CREATE TABLE currencies (
  code            VARCHAR(3)   NOT NULL,
  PRIMARY KEY (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE countries (
  code            VARCHAR(3)   NOT NULL,
  label           VARCHAR(60)  NOT NULL,
  currency_code   VARCHAR(3)   NOT NULL,
  PRIMARY KEY (code),
  UNIQUE KEY uq_countries_label (label),
  CONSTRAINT fk_countries_currency FOREIGN KEY (currency_code) REFERENCES currencies (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE severity_levels (            -- shared by priority, severity, risk level
  name            VARCHAR(10)  NOT NULL,  -- Critical | High | Medium | Low
  sort_order      TINYINT      NOT NULL,
  PRIMARY KEY (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE health_statuses (
  name            VARCHAR(20)  NOT NULL,  -- On Track | At Risk | Delayed | Blocked | Planning
  PRIMARY KEY (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE project_statuses (
  name            VARCHAR(20)  NOT NULL,
  PRIMARY KEY (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE project_categories (
  name            VARCHAR(20)  NOT NULL,
  PRIMARY KEY (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE implementation_types (
  name            VARCHAR(30)  NOT NULL,
  PRIMARY KEY (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE hospital_types (
  name            VARCHAR(30)  NOT NULL,
  PRIMARY KEY (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE project_integration_types (  -- masters.js INTEGRATION_TYPES (8)
  name            VARCHAR(30)  NOT NULL,
  PRIMARY KEY (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE lifecycle_stages (
  stage_key       VARCHAR(20)  NOT NULL,
  label           VARCHAR(40)  NOT NULL,
  seq             TINYINT      NOT NULL,
  tint            VARCHAR(16)  NULL,
  PRIMARY KEY (stage_key),
  UNIQUE KEY uq_lifecycle_seq (seq)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE hims_modules (
  id              VARCHAR(12)  NOT NULL,  -- 'M-OPD'
  name            VARCHAR(40)  NOT NULL,
  tint            VARCHAR(16)  NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_hims_modules_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE hospital_departments (
  name            VARCHAR(30)  NOT NULL,
  PRIMARY KEY (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE interfaces (
  name            VARCHAR(40)  NOT NULL,
  PRIMARY KEY (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE roles (
  id              VARCHAR(20)  NOT NULL,  -- admin, pmo, pm …
  label           VARCHAR(40)  NOT NULL,
  tint            VARCHAR(16)  NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE team_departments (
  name            VARCHAR(20)  NOT NULL,
  PRIMARY KEY (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE issue_types (
  name            VARCHAR(20)  NOT NULL,
  PRIMARY KEY (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE risk_types (
  name            VARCHAR(20)  NOT NULL,
  PRIMARY KEY (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE training_types (
  name            VARCHAR(30)  NOT NULL,
  PRIMARY KEY (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE doc_categories (
  name            VARCHAR(30)  NOT NULL,
  PRIMARY KEY (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE signoff_milestones (
  name            VARCHAR(40)  NOT NULL,
  PRIMARY KEY (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE bug_categories (
  name            VARCHAR(30)  NOT NULL,
  PRIMARY KEY (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE master_data_items (
  name            VARCHAR(40)  NOT NULL,
  PRIMARY KEY (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE notification_templates (     -- editable via Masters page
  id              VARCHAR(8)   NOT NULL,
  name            VARCHAR(80)  NOT NULL,
  channel         VARCHAR(30)  NOT NULL,
  trigger_event   VARCHAR(80)  NULL,
  active          TINYINT(1)   NOT NULL DEFAULT 1,
  created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- SIR lookups
CREATE TABLE integration_categories (     -- integration.js INTEGRATION_TYPES (10)
  name            VARCHAR(30)  NOT NULL,
  PRIMARY KEY (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE integration_statuses (
  name            VARCHAR(20)  NOT NULL,
  PRIMARY KEY (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE http_methods (
  name            VARCHAR(8)   NOT NULL,
  PRIMARY KEY (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE auth_types (
  name            VARCHAR(20)  NOT NULL,
  PRIMARY KEY (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE sir_doc_types (
  name            VARCHAR(30)  NOT NULL,
  PRIMARY KEY (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE workflow_steps_sir (
  step            TINYINT      NOT NULL,
  step_key        VARCHAR(20)  NOT NULL,
  label           VARCHAR(40)  NOT NULL,
  description     VARCHAR(120) NULL,
  icon            VARCHAR(20)  NULL,
  PRIMARY KEY (step),
  UNIQUE KEY uq_wf_sir_key (step_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- SFR lookups
CREATE TABLE feature_modules (
  name            VARCHAR(30)  NOT NULL,
  PRIMARY KEY (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE feature_categories (
  name            VARCHAR(30)  NOT NULL,
  PRIMARY KEY (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE feature_statuses (
  name            VARCHAR(30)  NOT NULL,
  stage           TINYINT      NULL,       -- STATUS_STAGE map
  tint            VARCHAR(16)  NULL,        -- STATUS_TINT map
  PRIMARY KEY (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE applicable_segments (
  name            VARCHAR(30)  NOT NULL,
  PRIMARY KEY (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE workflow_steps_sfr (
  step            TINYINT      NOT NULL,
  step_key        VARCHAR(20)  NOT NULL,
  label           VARCHAR(40)  NOT NULL,
  description     VARCHAR(120) NULL,
  icon            VARCHAR(20)  NULL,
  PRIMARY KEY (step),
  UNIQUE KEY uq_wf_sfr_key (step_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE kb_doc_types (
  name            VARCHAR(30)  NOT NULL,
  PRIMARY KEY (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================================
-- 2. PMO CORE — clients, team, projects
-- ============================================================================

CREATE TABLE clients (
  id                 VARCHAR(10)   NOT NULL,       -- 'CL-001'
  name               VARCHAR(120)  NOT NULL,
  group_name         VARCHAR(120)  NULL,
  hospital_type      VARCHAR(30)   NULL,
  country_code       VARCHAR(3)    NULL,
  state              VARCHAR(60)   NULL,
  city               VARCHAR(60)   NULL,
  beds               INT           NULL,
  branches           INT           NULL,
  gst                VARCHAR(40)   NULL,
  timezone           VARCHAR(40)   NULL,
  currency_code      VARCHAR(3)    NULL,
  since              DATE          NULL,
  active_projects    INT           NOT NULL DEFAULT 0,
  health_status      VARCHAR(20)   NULL,
  created_at         DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at         DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY ix_clients_name (name),
  KEY ix_clients_health (health_status),
  CONSTRAINT fk_clients_country  FOREIGN KEY (country_code)  REFERENCES countries (code),
  CONSTRAINT fk_clients_currency FOREIGN KEY (currency_code) REFERENCES currencies (code),
  CONSTRAINT fk_clients_htype    FOREIGN KEY (hospital_type) REFERENCES hospital_types (name),
  CONSTRAINT fk_clients_health   FOREIGN KEY (health_status) REFERENCES health_statuses (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE client_contacts (
  id              INT           NOT NULL AUTO_INCREMENT,
  client_id       VARCHAR(10)   NOT NULL,
  name            VARCHAR(120)  NOT NULL,
  title           VARCHAR(120)  NULL,
  phone           VARCHAR(40)   NULL,
  email           VARCHAR(120)  NULL,
  is_primary      TINYINT(1)    NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  KEY ix_client_contacts_client (client_id),
  CONSTRAINT fk_client_contacts_client FOREIGN KEY (client_id) REFERENCES clients (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE client_escalations (
  id              INT           NOT NULL AUTO_INCREMENT,
  client_id       VARCHAR(10)   NOT NULL,
  level           VARCHAR(4)    NOT NULL,          -- L1 | L2 | L3
  role            VARCHAR(60)   NULL,
  name            VARCHAR(120)  NULL,
  sla             VARCHAR(20)   NULL,
  PRIMARY KEY (id),
  KEY ix_client_esc_client (client_id),
  CONSTRAINT fk_client_esc_client FOREIGN KEY (client_id) REFERENCES clients (id) ON DELETE CASCADE,
  CONSTRAINT ck_client_esc_level CHECK (level IN ('L1','L2','L3'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE team_members (
  id              VARCHAR(8)    NOT NULL,          -- 'U-01'
  name            VARCHAR(120)  NOT NULL,
  role_label      VARCHAR(60)   NULL,
  role_id         VARCHAR(20)   NULL,
  email           VARCHAR(120)  NULL,
  phone           VARCHAR(40)   NULL,
  avatar_hue      INT           NULL,
  department      VARCHAR(20)   NULL,
  utilisation     INT           NULL,
  active          TINYINT(1)    NOT NULL DEFAULT 1,
  created_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY ix_team_name (name),
  CONSTRAINT fk_team_role FOREIGN KEY (role_id)     REFERENCES roles (id),
  CONSTRAINT fk_team_dept FOREIGN KEY (department)  REFERENCES team_departments (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE projects (
  code                 VARCHAR(20)   NOT NULL,     -- 'PRJ-2025-014'
  name                 VARCHAR(160)  NOT NULL,
  client_id            VARCHAR(10)   NOT NULL,
  category             VARCHAR(20)   NULL,
  implementation_type  VARCHAR(30)   NULL,
  priority             VARCHAR(10)   NULL,
  status               VARCHAR(20)   NULL,
  contract_value       DECIMAL(16,2) NULL,
  currency_code        VARCHAR(3)    NULL,
  po_number            VARCHAR(40)   NULL,
  po_date              DATE          NULL,
  start_date           DATE          NULL,
  target_go_live       DATE          NULL,
  actual_completion    DATE          NULL,
  pm_id                VARCHAR(8)    NULL,
  fc_id                VARCHAR(8)    NULL,
  tc_id                VARCHAR(8)    NULL,
  engineer_id          VARCHAR(8)    NULL,
  support_id           VARCHAR(8)    NULL,
  sales_person_id      VARCHAR(8)    NULL,
  current_stage        VARCHAR(20)   NULL,
  blocked_at           VARCHAR(20)   NULL,
  health_status        VARCHAR(20)   NULL,
  risk_level           VARCHAR(10)   NULL,
  users_count          INT           NULL,
  remarks              TEXT          NULL,
  created_at           DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at           DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (code),
  KEY ix_projects_client (client_id),
  KEY ix_projects_status (status),
  KEY ix_projects_health (health_status),
  KEY ix_projects_priority (priority),
  KEY ix_projects_name (name),
  CONSTRAINT fk_projects_client   FOREIGN KEY (client_id)           REFERENCES clients (id),
  CONSTRAINT fk_projects_category FOREIGN KEY (category)            REFERENCES project_categories (name),
  CONSTRAINT fk_projects_impl     FOREIGN KEY (implementation_type) REFERENCES implementation_types (name),
  CONSTRAINT fk_projects_priority FOREIGN KEY (priority)            REFERENCES severity_levels (name),
  CONSTRAINT fk_projects_status   FOREIGN KEY (status)              REFERENCES project_statuses (name),
  CONSTRAINT fk_projects_currency FOREIGN KEY (currency_code)       REFERENCES currencies (code),
  CONSTRAINT fk_projects_stage    FOREIGN KEY (current_stage)       REFERENCES lifecycle_stages (stage_key),
  CONSTRAINT fk_projects_blocked  FOREIGN KEY (blocked_at)          REFERENCES lifecycle_stages (stage_key),
  CONSTRAINT fk_projects_health   FOREIGN KEY (health_status)       REFERENCES health_statuses (name),
  CONSTRAINT fk_projects_risk     FOREIGN KEY (risk_level)          REFERENCES severity_levels (name),
  CONSTRAINT fk_projects_pm       FOREIGN KEY (pm_id)               REFERENCES team_members (id),
  CONSTRAINT fk_projects_fc       FOREIGN KEY (fc_id)               REFERENCES team_members (id),
  CONSTRAINT fk_projects_tc       FOREIGN KEY (tc_id)               REFERENCES team_members (id),
  CONSTRAINT fk_projects_eng      FOREIGN KEY (engineer_id)         REFERENCES team_members (id),
  CONSTRAINT fk_projects_support  FOREIGN KEY (support_id)          REFERENCES team_members (id),
  CONSTRAINT fk_projects_sales    FOREIGN KEY (sales_person_id)     REFERENCES team_members (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE project_modules (
  project_code    VARCHAR(20)   NOT NULL,
  module_id       VARCHAR(12)   NOT NULL,
  PRIMARY KEY (project_code, module_id),
  KEY ix_pm_module (module_id),
  CONSTRAINT fk_pm_project FOREIGN KEY (project_code) REFERENCES projects (code) ON DELETE CASCADE,
  CONSTRAINT fk_pm_module  FOREIGN KEY (module_id)    REFERENCES hims_modules (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE project_interfaces (
  project_code    VARCHAR(20)   NOT NULL,
  interface_name  VARCHAR(40)   NOT NULL,
  PRIMARY KEY (project_code, interface_name),
  KEY ix_pi_interface (interface_name),
  CONSTRAINT fk_pi_project   FOREIGN KEY (project_code)   REFERENCES projects (code) ON DELETE CASCADE,
  CONSTRAINT fk_pi_interface FOREIGN KEY (interface_name) REFERENCES interfaces (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE project_milestones (
  id              INT           NOT NULL AUTO_INCREMENT,
  project_code    VARCHAR(20)   NOT NULL,
  stage_key       VARCHAR(20)   NOT NULL,
  seq             TINYINT       NOT NULL,
  plan_start      DATE          NULL,
  plan_end        DATE          NULL,
  actual_end      DATE          NULL,
  status          VARCHAR(15)   NOT NULL,
  owner_role      VARCHAR(10)   NULL,
  signoff         VARCHAR(10)   NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_milestone (project_code, stage_key),
  KEY ix_milestone_status (status),
  CONSTRAINT fk_ms_project FOREIGN KEY (project_code) REFERENCES projects (code) ON DELETE CASCADE,
  CONSTRAINT fk_ms_stage   FOREIGN KEY (stage_key)    REFERENCES lifecycle_stages (stage_key),
  CONSTRAINT ck_ms_status  CHECK (status IN ('Pending','Completed','In Progress','Blocked'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================================
-- 3. PMO DELIVERY / SRS / GOVERNANCE  (all → projects.code)
-- ============================================================================

CREATE TABLE srs_sessions (
  id              VARCHAR(12)   NOT NULL,          -- 'SRS-001'
  project_code    VARCHAR(20)   NOT NULL,
  department      VARCHAR(30)   NULL,
  consultant      VARCHAR(120)  NULL,
  phase           VARCHAR(40)   NULL,
  planned         DATE          NULL,
  actual          DATE          NULL,
  status          VARCHAR(20)   NOT NULL,
  requirements    INT           NOT NULL DEFAULT 0,
  gaps            INT           NOT NULL DEFAULT 0,
  crs             INT           NOT NULL DEFAULT 0,
  signoff         VARCHAR(10)   NULL,
  created_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY ix_srs_project (project_code),
  KEY ix_srs_status (status),
  CONSTRAINT fk_srs_project FOREIGN KEY (project_code) REFERENCES projects (code) ON DELETE CASCADE,
  CONSTRAINT fk_srs_dept    FOREIGN KEY (department)   REFERENCES hospital_departments (name),
  CONSTRAINT ck_srs_status  CHECK (status IN ('Scheduled','In Progress','Completed','Signed Off'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE requirements (
  id              VARCHAR(12)   NOT NULL,          -- 'REQ-001'
  project_code    VARCHAR(20)   NOT NULL,
  title           VARCHAR(200)  NOT NULL,
  department      VARCHAR(30)   NULL,
  type            VARCHAR(20)   NOT NULL,          -- Standard | Gap | Change Request
  priority        VARCHAR(10)   NULL,
  status          VARCHAR(20)   NOT NULL,
  effort_days     INT           NOT NULL DEFAULT 0,
  raised_by       VARCHAR(120)  NULL,
  approved_by     VARCHAR(120)  NULL,
  signoff_date    DATE          NULL,
  cr_value        DECIMAL(14,2) NOT NULL DEFAULT 0,
  created_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY ix_req_project (project_code),
  KEY ix_req_type (type),
  KEY ix_req_status (status),
  CONSTRAINT fk_req_project  FOREIGN KEY (project_code) REFERENCES projects (code) ON DELETE CASCADE,
  CONSTRAINT fk_req_dept     FOREIGN KEY (department)   REFERENCES hospital_departments (name),
  CONSTRAINT fk_req_priority FOREIGN KEY (priority)     REFERENCES severity_levels (name),
  CONSTRAINT ck_req_type   CHECK (type IN ('Standard','Gap','Change Request')),
  CONSTRAINT ck_req_status CHECK (status IN ('Approved','In Discussion','Gap Identified','CR Raised'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE master_data_records (
  id              VARCHAR(12)   NOT NULL,          -- 'MD-001'
  project_code    VARCHAR(20)   NOT NULL,
  master_item     VARCHAR(40)   NOT NULL,
  requested       TINYINT(1)    NOT NULL DEFAULT 0,
  received        TINYINT(1)    NOT NULL DEFAULT 0,
  imported        TINYINT(1)    NOT NULL DEFAULT 0,
  requested_on    DATETIME      NULL,
  received_on     DATETIME      NULL,
  imported_on     DATETIME      NULL,
  records         INT           NOT NULL DEFAULT 0,
  failed          INT           NOT NULL DEFAULT 0,
  validation      VARCHAR(15)   NULL,
  owner           VARCHAR(120)  NULL,
  status          VARCHAR(30)   NOT NULL,
  created_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY ix_md_project (project_code),
  KEY ix_md_status (status),
  CONSTRAINT fk_md_project FOREIGN KEY (project_code) REFERENCES projects (code) ON DELETE CASCADE,
  CONSTRAINT fk_md_item    FOREIGN KEY (master_item)  REFERENCES master_data_items (name),
  CONSTRAINT ck_md_status  CHECK (status IN ('Awaited','Validation Pending','Imported','Imported (with errors)')),
  CONSTRAINT ck_md_valid   CHECK (validation IN ('Passed','Errors','Pending','—'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE development_items (
  id              VARCHAR(12)   NOT NULL,          -- 'DEV-001'
  project_code    VARCHAR(20)   NOT NULL,
  feature         VARCHAR(120)  NOT NULL,
  module_id       VARCHAR(12)   NULL,
  type            VARCHAR(15)   NOT NULL,          -- Development | Configuration
  developer       VARCHAR(120)  NULL,
  status          VARCHAR(20)   NOT NULL,
  effort_days     INT           NOT NULL DEFAULT 0,
  dev_date        DATE          NULL,
  deploy_date     DATE          NULL,
  progress        INT           NOT NULL DEFAULT 0,
  created_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY ix_dev_project (project_code),
  KEY ix_dev_status (status),
  CONSTRAINT fk_dev_project FOREIGN KEY (project_code) REFERENCES projects (code) ON DELETE CASCADE,
  CONSTRAINT fk_dev_module  FOREIGN KEY (module_id)    REFERENCES hims_modules (id),
  CONSTRAINT ck_dev_type    CHECK (type IN ('Development','Configuration')),
  CONSTRAINT ck_dev_status  CHECK (status IN ('Deployed','In Testing','In Development','Configured','Backlog'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE uat_cases (
  id              VARCHAR(12)   NOT NULL,          -- 'UAT-001'
  project_code    VARCHAR(20)   NOT NULL,
  module_id       VARCHAR(12)   NULL,
  total           INT           NOT NULL DEFAULT 0,
  passed          INT           NOT NULL DEFAULT 0,
  failed          INT           NOT NULL DEFAULT 0,
  pending         INT           NOT NULL DEFAULT 0,
  status          VARCHAR(15)   NOT NULL,
  tester          VARCHAR(120)  NULL,
  uat_date        DATE          NULL,
  signoff         VARCHAR(10)   NULL,
  created_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY ix_uat_project (project_code),
  KEY ix_uat_status (status),
  CONSTRAINT fk_uat_project FOREIGN KEY (project_code) REFERENCES projects (code) ON DELETE CASCADE,
  CONSTRAINT fk_uat_module  FOREIGN KEY (module_id)    REFERENCES hims_modules (id),
  CONSTRAINT ck_uat_status  CHECK (status IN ('Passed','Failed','In Progress','Blocked','Not Started'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE bugs (
  id              VARCHAR(12)   NOT NULL,          -- 'BUG-001'
  project_code    VARCHAR(20)   NOT NULL,
  title           VARCHAR(200)  NOT NULL,
  module_id       VARCHAR(12)   NULL,
  severity        VARCHAR(10)   NULL,
  category        VARCHAR(30)   NULL,
  details         TEXT          NULL,
  status          VARCHAR(15)   NOT NULL,
  reported_by     VARCHAR(120)  NULL,
  assigned_to     VARCHAR(120)  NULL,
  reported        DATE          NULL,
  resolved        DATE          NULL,
  created_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY ix_bugs_project (project_code),
  KEY ix_bugs_status (status),
  KEY ix_bugs_severity (severity),
  CONSTRAINT fk_bugs_project  FOREIGN KEY (project_code) REFERENCES projects (code) ON DELETE CASCADE,
  CONSTRAINT fk_bugs_module   FOREIGN KEY (module_id)    REFERENCES hims_modules (id),
  CONSTRAINT fk_bugs_severity FOREIGN KEY (severity)     REFERENCES severity_levels (name),
  CONSTRAINT fk_bugs_category FOREIGN KEY (category)     REFERENCES bug_categories (name),
  CONSTRAINT ck_bugs_status CHECK (status IN ('Open','In Progress','Fixed','Retest','Closed','Reopened'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE trainings (
  id                 VARCHAR(12)   NOT NULL,       -- 'TRN-001'
  project_code       VARCHAR(20)   NOT NULL,
  department         VARCHAR(30)   NULL,
  type               VARCHAR(30)   NULL,
  trainer            VARCHAR(120)  NULL,
  date               DATE          NULL,
  duration_hrs       INT           NULL,
  planned_attendees  INT           NOT NULL DEFAULT 0,
  attendance         INT           NOT NULL DEFAULT 0,
  status             VARCHAR(15)   NOT NULL,
  feedback           DECIMAL(3,1)  NULL,
  signoff            VARCHAR(10)   NULL,
  created_at         DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at         DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY ix_trn_project (project_code),
  KEY ix_trn_status (status),
  CONSTRAINT fk_trn_project FOREIGN KEY (project_code) REFERENCES projects (code) ON DELETE CASCADE,
  CONSTRAINT fk_trn_dept    FOREIGN KEY (department)   REFERENCES hospital_departments (name),
  CONSTRAINT fk_trn_type    FOREIGN KEY (type)         REFERENCES training_types (name),
  CONSTRAINT ck_trn_status  CHECK (status IN ('Completed','Scheduled','Planned'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE golive_readiness (
  id              VARCHAR(20)   NOT NULL,          -- project_code based
  project_code    VARCHAR(20)   NOT NULL,
  target_go_live  DATE          NULL,
  readiness       INT           NOT NULL DEFAULT 0,
  status          VARCHAR(20)   NOT NULL,
  created_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_golive_project (project_code),
  CONSTRAINT fk_golive_project FOREIGN KEY (project_code) REFERENCES projects (code) ON DELETE CASCADE,
  CONSTRAINT ck_golive_status  CHECK (status IN ('Ready','Almost Ready','Preparing'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE golive_readiness_items (
  id              INT           NOT NULL AUTO_INCREMENT,
  readiness_id    VARCHAR(20)   NOT NULL,
  item            VARCHAR(120)  NOT NULL,
  status          VARCHAR(15)   NOT NULL,
  owner_role      VARCHAR(10)   NULL,
  PRIMARY KEY (id),
  KEY ix_gli_readiness (readiness_id),
  CONSTRAINT fk_gli_readiness FOREIGN KEY (readiness_id) REFERENCES golive_readiness (id) ON DELETE CASCADE,
  CONSTRAINT ck_gli_status CHECK (status IN ('Done','In Progress','Pending'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE live_imports (
  id              VARCHAR(12)   NOT NULL,          -- 'LIM-001'
  project_code    VARCHAR(20)   NOT NULL,
  master_item     VARCHAR(40)   NOT NULL,
  import_date     DATE          NULL,
  imported_by     VARCHAR(120)  NULL,
  records         INT           NOT NULL DEFAULT 0,
  failed          INT           NOT NULL DEFAULT 0,
  validation      VARCHAR(15)   NULL,
  status          VARCHAR(20)   NOT NULL,
  created_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY ix_lim_project (project_code),
  CONSTRAINT fk_lim_project FOREIGN KEY (project_code) REFERENCES projects (code) ON DELETE CASCADE,
  CONSTRAINT ck_lim_status  CHECK (status IN ('Imported','Imported (errors)','Scheduled'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE parallel_golive (
  id                VARCHAR(24)   NOT NULL,        -- 'PGL-<code>'
  project_code      VARCHAR(20)   NOT NULL,
  start_date        DATE          NULL,
  end_date          DATE          NULL,
  days              INT           NULL,
  issues_logged     INT           NOT NULL DEFAULT 0,
  issues_resolved   INT           NOT NULL DEFAULT 0,
  support_engineer  VARCHAR(120)  NULL,
  daily_status      VARCHAR(20)   NULL,
  client_feedback   DECIMAL(3,1)  NULL,
  status            VARCHAR(20)   NOT NULL,
  created_at        DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY ix_pgl_project (project_code),
  CONSTRAINT fk_pgl_project FOREIGN KEY (project_code) REFERENCES projects (code) ON DELETE CASCADE,
  CONSTRAINT ck_pgl_status  CHECK (status IN ('Running','Stabilising','Completed'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE final_golive (
  id              VARCHAR(24)   NOT NULL,          -- 'FGL-<code>'
  project_code    VARCHAR(20)   NOT NULL,
  go_live_date    DATE          NULL,
  approved_by     VARCHAR(120)  NULL,
  modules_live    INT           NOT NULL DEFAULT 0,
  modules_total   INT           NOT NULL DEFAULT 0,
  pending_items   INT           NOT NULL DEFAULT 0,
  certificate     VARCHAR(10)   NULL,
  signoff         VARCHAR(10)   NULL,
  status          VARCHAR(24)   NOT NULL,
  created_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY ix_fgl_project (project_code),
  CONSTRAINT fk_fgl_project FOREIGN KEY (project_code) REFERENCES projects (code) ON DELETE CASCADE,
  CONSTRAINT ck_fgl_status  CHECK (status IN ('Live','Live (with punch-list)','Scheduled'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE issues (
  id              VARCHAR(12)   NOT NULL,          -- 'ISS-001'
  project_code    VARCHAR(20)   NOT NULL,
  title           VARCHAR(200)  NOT NULL,
  type            VARCHAR(20)   NULL,
  module_id       VARCHAR(12)   NULL,
  severity        VARCHAR(10)   NULL,
  status          VARCHAR(15)   NOT NULL,
  reported_by     VARCHAR(120)  NULL,
  assigned_to     VARCHAR(120)  NULL,
  raised          DATE          NULL,
  due             DATE          NULL,
  resolved        DATE          NULL,
  age_days        INT           NULL,
  created_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY ix_iss_project (project_code),
  KEY ix_iss_status (status),
  KEY ix_iss_severity (severity),
  CONSTRAINT fk_iss_project  FOREIGN KEY (project_code) REFERENCES projects (code) ON DELETE CASCADE,
  CONSTRAINT fk_iss_type     FOREIGN KEY (type)         REFERENCES issue_types (name),
  CONSTRAINT fk_iss_module   FOREIGN KEY (module_id)    REFERENCES hims_modules (id),
  CONSTRAINT fk_iss_severity FOREIGN KEY (severity)     REFERENCES severity_levels (name),
  CONSTRAINT ck_iss_status CHECK (status IN ('Open','In Progress','On Hold','Resolved','Closed'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE risks (
  id              VARCHAR(12)   NOT NULL,          -- 'RSK-001'
  project_code    VARCHAR(20)   NOT NULL,
  title           VARCHAR(200)  NOT NULL,
  category        VARCHAR(20)   NULL,
  probability     TINYINT       NOT NULL,
  impact          TINYINT       NOT NULL,
  score           TINYINT       NOT NULL,
  level           VARCHAR(10)   NULL,
  owner           VARCHAR(120)  NULL,
  status          VARCHAR(15)   NOT NULL,
  mitigation      TEXT          NULL,
  target          DATE          NULL,
  created_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY ix_rsk_project (project_code),
  KEY ix_rsk_status (status),
  KEY ix_rsk_level (level),
  CONSTRAINT fk_rsk_project  FOREIGN KEY (project_code) REFERENCES projects (code) ON DELETE CASCADE,
  CONSTRAINT fk_rsk_category FOREIGN KEY (category)     REFERENCES risk_types (name),
  CONSTRAINT fk_rsk_level    FOREIGN KEY (level)        REFERENCES severity_levels (name),
  CONSTRAINT ck_rsk_prob   CHECK (probability BETWEEN 1 AND 5),
  CONSTRAINT ck_rsk_impact CHECK (impact BETWEEN 1 AND 5),
  CONSTRAINT ck_rsk_status CHECK (status IN ('Open','Mitigating','Monitoring','Closed'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE signoffs (
  id              VARCHAR(12)   NOT NULL,          -- 'SGN-001'
  project_code    VARCHAR(20)   NOT NULL,
  milestone       VARCHAR(40)   NOT NULL,
  status          VARCHAR(15)   NOT NULL,
  signed_by       VARCHAR(120)  NULL,
  designation     VARCHAR(120)  NULL,
  date            DATE          NULL,
  method          VARCHAR(24)   NULL,
  remarks         TEXT          NULL,
  created_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY ix_sgn_project (project_code),
  KEY ix_sgn_status (status),
  CONSTRAINT fk_sgn_project   FOREIGN KEY (project_code) REFERENCES projects (code) ON DELETE CASCADE,
  CONSTRAINT fk_sgn_milestone FOREIGN KEY (milestone)    REFERENCES signoff_milestones (name),
  CONSTRAINT ck_sgn_status CHECK (status IN ('Signed','Pending','Not Reached')),
  CONSTRAINT ck_sgn_method CHECK (method IN ('Digital Signature','e-Sign (OTP)','Scanned PDF','—'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE documents (
  id              VARCHAR(12)   NOT NULL,          -- 'DOC-001'
  project_code    VARCHAR(20)   NOT NULL,
  name            VARCHAR(200)  NOT NULL,
  category        VARCHAR(30)   NULL,
  ext             VARCHAR(8)    NULL,
  version         VARCHAR(12)   NULL,
  size_kb         INT           NULL,
  uploaded_by     VARCHAR(120)  NULL,
  uploaded_on     DATE          NULL,
  shared          TINYINT(1)    NOT NULL DEFAULT 0,
  created_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY ix_doc_project (project_code),
  KEY ix_doc_category (category),
  CONSTRAINT fk_doc_project  FOREIGN KEY (project_code) REFERENCES projects (code) ON DELETE CASCADE,
  CONSTRAINT fk_doc_category FOREIGN KEY (category)     REFERENCES doc_categories (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================================
-- 4. STANDALONE — activity schedule, hospital users
-- ============================================================================

CREATE TABLE activity_schedule (
  id              VARCHAR(12)   NOT NULL,          -- 'ACT-001'
  activity        VARCHAR(200)  NOT NULL,
  phase           VARCHAR(10)   NULL,              -- '1' | '2' | '1,2'
  clinic          VARCHAR(120)  NULL,
  status          VARCHAR(15)   NULL,              -- Done | Pending
  mode            VARCHAR(10)   NULL,              -- Onsite | Offsite
  days            INT           NULL,
  start_date      DATE          NULL,
  end_date        DATE          NULL,
  actual_start    DATE          NULL,
  actual_end      DATE          NULL,
  group_name      VARCHAR(40)   NULL,
  project_code    VARCHAR(20)   NULL,              -- nullable link (added feature)
  created_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY ix_act_status (status),
  KEY ix_act_phase (phase),
  KEY ix_act_project (project_code),
  CONSTRAINT fk_act_project FOREIGN KEY (project_code) REFERENCES projects (code) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE activity_modules (
  activity_id     VARCHAR(12)   NOT NULL,
  module_id       VARCHAR(12)   NOT NULL,
  PRIMARY KEY (activity_id, module_id),
  KEY ix_am_module (module_id),
  CONSTRAINT fk_am_activity FOREIGN KEY (activity_id) REFERENCES activity_schedule (id) ON DELETE CASCADE,
  CONSTRAINT fk_am_module   FOREIGN KEY (module_id)   REFERENCES hims_modules (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE hospital_users (
  id              VARCHAR(12)   NOT NULL,          -- 'USR-001'
  sr_no           INT           NULL,
  department      VARCHAR(60)   NULL,              -- free text (dirty source data)
  employee        VARCHAR(120)  NULL,
  designation     VARCHAR(120)  NULL,
  user_type       VARCHAR(40)   NULL,
  email           VARCHAR(120)  NULL,
  mobile          VARCHAR(40)   NULL,
  modules         VARCHAR(120)  NULL,
  created_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY ix_husers_dept (department),
  KEY ix_husers_type (user_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================================
-- 5. SIR — Smart Integration Records
-- ============================================================================

CREATE TABLE integrations (
  id              VARCHAR(10)   NOT NULL,          -- 'INT-01'
  name            VARCHAR(120)  NOT NULL,
  type            VARCHAR(30)   NULL,
  vendor          VARCHAR(120)  NULL,
  company         VARCHAR(120)  NULL,
  contact         VARCHAR(120)  NULL,
  email           VARCHAR(120)  NULL,
  phone           VARCHAR(40)   NULL,
  website         VARCHAR(160)  NULL,
  doc_link        VARCHAR(200)  NULL,
  status          VARCHAR(20)   NULL,
  stage           TINYINT       NULL,
  reusable        TINYINT(1)    NOT NULL DEFAULT 0,
  total_apis      INT           NOT NULL DEFAULT 0,
  created_on      DATE          NULL,
  last_updated    DATE          NULL,
  description     TEXT          NULL,
  created_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY ix_int_name (name),
  KEY ix_int_status (status),
  KEY ix_int_type (type),
  CONSTRAINT fk_int_type   FOREIGN KEY (type)   REFERENCES integration_categories (name),
  CONSTRAINT fk_int_status FOREIGN KEY (status) REFERENCES integration_statuses (name),
  CONSTRAINT fk_int_stage  FOREIGN KEY (stage)  REFERENCES workflow_steps_sir (step)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE process_flows (
  id                INT           NOT NULL AUTO_INCREMENT,
  integration_id    VARCHAR(10)   NOT NULL,
  process_name      VARCHAR(160)  NULL,
  business_rules    TEXT          NULL,
  exception_cases   TEXT          NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_pf_integration (integration_id),
  CONSTRAINT fk_pf_integration FOREIGN KEY (integration_id) REFERENCES integrations (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE process_flow_steps (
  id              INT           NOT NULL AUTO_INCREMENT,
  flow_id         INT           NOT NULL,
  seq             INT           NOT NULL,
  step_text       VARCHAR(200)  NOT NULL,
  PRIMARY KEY (id),
  KEY ix_pfs_flow (flow_id),
  CONSTRAINT fk_pfs_flow FOREIGN KEY (flow_id) REFERENCES process_flows (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE apis (
  id              VARCHAR(12)   NOT NULL,          -- 'API-1001'
  integration_id  VARCHAR(10)   NOT NULL,
  name            VARCHAR(120)  NOT NULL,
  purpose         VARCHAR(200)  NULL,
  method          VARCHAR(8)    NULL,
  url             VARCHAR(255)  NULL,
  sandbox_url     VARCHAR(200)  NULL,
  live_url        VARCHAR(200)  NULL,
  auth_type       VARCHAR(20)   NULL,
  headers         VARCHAR(255)  NULL,
  status          VARCHAR(20)   NULL,
  created_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY ix_api_integration (integration_id),
  KEY ix_api_method (method),
  KEY ix_api_name (name),
  CONSTRAINT fk_api_integration FOREIGN KEY (integration_id) REFERENCES integrations (id) ON DELETE CASCADE,
  CONSTRAINT fk_api_method      FOREIGN KEY (method)         REFERENCES http_methods (name),
  CONSTRAINT fk_api_auth        FOREIGN KEY (auth_type)      REFERENCES auth_types (name),
  CONSTRAINT fk_api_status      FOREIGN KEY (status)         REFERENCES integration_statuses (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE api_payloads (
  id                INT           NOT NULL AUTO_INCREMENT,
  api_id            VARCHAR(12)   NOT NULL,
  request_payload   TEXT          NULL,
  success_response  TEXT          NULL,
  error_response    TEXT          NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_payload_api (api_id),
  CONSTRAINT fk_payload_api FOREIGN KEY (api_id) REFERENCES apis (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE hims_changes (
  id              VARCHAR(10)   NOT NULL,          -- 'HC-01'
  integration_id  VARCHAR(10)   NOT NULL,
  module          VARCHAR(40)   NULL,
  screen          VARCHAR(120)  NULL,
  screen_path     VARCHAR(160)  NULL,
  control         VARCHAR(120)  NULL,
  button          VARCHAR(120)  NULL,
  stored_proc     VARCHAR(120)  NULL,
  api_called      VARCHAR(120)  NULL,
  table_changed   VARCHAR(160)  NULL,
  logic           TEXT          NULL,
  document        VARCHAR(200)  NULL,
  created_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY ix_hc_integration (integration_id),
  CONSTRAINT fk_hc_integration FOREIGN KEY (integration_id) REFERENCES integrations (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE db_changes (
  id              VARCHAR(10)   NOT NULL,          -- 'DB-01' / 'DBC-01'
  integration_id  VARCHAR(10)   NOT NULL,
  table_name      VARCHAR(120)  NULL,
  new_columns     VARCHAR(255)  NULL,
  alter_script    TEXT          NULL,
  new_sp          VARCHAR(255)  NULL,
  modified_sp     VARCHAR(255)  NULL,
  trigger_name    VARCHAR(120)  NULL,
  scheduler       VARCHAR(120)  NULL,
  created_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY ix_dbc_integration (integration_id),
  CONSTRAINT fk_dbc_integration FOREIGN KEY (integration_id) REFERENCES integrations (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE source_code (
  id                VARCHAR(10)   NOT NULL,        -- 'SC-01'
  integration_id    VARCHAR(10)   NOT NULL,
  project           VARCHAR(120)  NULL,
  layer             VARCHAR(20)   NULL,
  folder            VARCHAR(160)  NULL,
  class_name        VARCHAR(120)  NULL,
  method_name       VARCHAR(120)  NULL,
  function_name     VARCHAR(120)  NULL,
  api_service_file  VARCHAR(160)  NULL,
  created_at        DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY ix_sc_integration (integration_id),
  CONSTRAINT fk_sc_integration FOREIGN KEY (integration_id) REFERENCES integrations (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE integration_screens (
  id                VARCHAR(10)   NOT NULL,        -- 'SR-01'
  integration_id    VARCHAR(10)   NOT NULL,
  screen_name       VARCHAR(120)  NULL,
  changed_controls  VARCHAR(255)  NULL,
  validation        VARCHAR(255)  NULL,
  buttons           VARCHAR(255)  NULL,
  dropdowns         VARCHAR(255)  NULL,
  new_fields        VARCHAR(255)  NULL,
  created_at        DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY ix_iscr_integration (integration_id),
  CONSTRAINT fk_iscr_integration FOREIGN KEY (integration_id) REFERENCES integrations (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE client_implementations (
  id              VARCHAR(10)   NOT NULL,          -- 'CI-01'
  integration_id  VARCHAR(10)   NOT NULL,
  client          VARCHAR(120)  NOT NULL,
  status          VARCHAR(15)   NULL,             -- Live | UAT | Pending
  live_date       DATE          NULL,
  version         VARCHAR(12)   NULL,
  reusable        TINYINT(1)    NOT NULL DEFAULT 0,
  created_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY ix_ci_integration (integration_id),
  KEY ix_ci_status (status),
  CONSTRAINT fk_ci_integration FOREIGN KEY (integration_id) REFERENCES integrations (id) ON DELETE CASCADE,
  CONSTRAINT ck_ci_status CHECK (status IN ('Live','UAT','Pending'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE integration_test_cases (
  id              VARCHAR(10)   NOT NULL,          -- 'TC-01'
  integration_id  VARCHAR(10)   NOT NULL,
  test_case       VARCHAR(200)  NOT NULL,
  api_tested      VARCHAR(120)  NULL,
  tester          VARCHAR(120)  NULL,
  test_date       DATE          NULL,
  result          VARCHAR(15)   NULL,             -- Pass | Fail | In Progress
  bug_found       INT           NOT NULL DEFAULT 0,
  bug_fixed       INT           NOT NULL DEFAULT 0,
  created_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY ix_itc_integration (integration_id),
  KEY ix_itc_result (result),
  CONSTRAINT fk_itc_integration FOREIGN KEY (integration_id) REFERENCES integrations (id) ON DELETE CASCADE,
  CONSTRAINT ck_itc_result CHECK (result IN ('Pass','Fail','In Progress'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE integration_documents (
  id              VARCHAR(10)   NOT NULL,          -- 'DOC-01' (SIR)
  integration_id  VARCHAR(10)   NOT NULL,
  name            VARCHAR(200)  NOT NULL,
  type            VARCHAR(30)   NULL,
  size            VARCHAR(20)   NULL,
  uploaded_by     VARCHAR(120)  NULL,
  uploaded_on     DATE          NULL,
  created_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY ix_idoc_integration (integration_id),
  CONSTRAINT fk_idoc_integration FOREIGN KEY (integration_id) REFERENCES integrations (id) ON DELETE CASCADE,
  CONSTRAINT fk_idoc_type        FOREIGN KEY (type)           REFERENCES sir_doc_types (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE version_history (
  id              VARCHAR(10)   NOT NULL,          -- 'VH-01'
  integration_id  VARCHAR(10)   NOT NULL,
  version         VARCHAR(20)   NOT NULL,
  date            DATE          NULL,
  modified_by     VARCHAR(120)  NULL,
  changes         TEXT          NULL,
  created_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY ix_vh_integration (integration_id),
  CONSTRAINT fk_vh_integration FOREIGN KEY (integration_id) REFERENCES integrations (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE developer_notes (
  id                VARCHAR(10)   NOT NULL,        -- 'DN-01'
  integration_id    VARCHAR(10)   NOT NULL,
  code_location     VARCHAR(200)  NULL,
  important_notes   TEXT          NULL,
  common_errors     TEXT          NULL,
  debugging_steps   TEXT          NULL,
  deployment_steps  TEXT          NULL,
  created_at        DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY ix_dn_integration (integration_id),
  CONSTRAINT fk_dn_integration FOREIGN KEY (integration_id) REFERENCES integrations (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE vendors (
  id                 VARCHAR(10)   NOT NULL,       -- 'VN-01'
  name               VARCHAR(120)  NOT NULL,
  company            VARCHAR(120)  NULL,
  contact            VARCHAR(120)  NULL,
  email              VARCHAR(120)  NULL,
  phone              VARCHAR(40)   NULL,
  website            VARCHAR(160)  NULL,
  type               VARCHAR(30)   NULL,
  integrations_count INT           NOT NULL DEFAULT 0,
  created_at         DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at         DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY ix_vendors_type (type),
  CONSTRAINT fk_vendors_type FOREIGN KEY (type) REFERENCES integration_categories (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================================
-- 6. SFR — Feature Intelligence
-- ============================================================================

CREATE TABLE features (
  id                    VARCHAR(12)   NOT NULL,    -- 'FEA-1001'
  name                  VARCHAR(160)  NOT NULL,
  module                VARCHAR(30)   NULL,
  category              VARCHAR(30)   NULL,
  client                VARCHAR(120)  NULL,
  request_date          DATE          NULL,
  priority              VARCHAR(10)   NULL,
  est_dev_time          VARCHAR(30)   NULL,
  status                VARCHAR(30)   NULL,
  impact_score          DECIMAL(3,1)  NULL,
  reusable              TINYINT(1)    NOT NULL DEFAULT 0,
  revenue_generated     DECIMAL(16,2) NOT NULL DEFAULT 0,
  dev_cost              DECIMAL(16,2) NOT NULL DEFAULT 0,
  clients_using         INT           NOT NULL DEFAULT 0,
  total_impl            INT           NOT NULL DEFAULT 0,
  support_tickets       INT           NOT NULL DEFAULT 0,
  satisfaction          DECIMAL(3,1)  NULL,
  roi_score             INT           NOT NULL DEFAULT 0,
  adoption_rate         INT           NOT NULL DEFAULT 0,
  functional_consultant VARCHAR(120)  NULL,
  project_manager       VARCHAR(120)  NULL,
  developer             VARCHAR(120)  NULL,
  requested_by          VARCHAR(120)  NULL,
  business_problem      TEXT          NULL,
  proposed_solution     TEXT          NULL,
  created_at            DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at            DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY ix_feat_name (name),
  KEY ix_feat_status (status),
  KEY ix_feat_priority (priority),
  KEY ix_feat_module (module),
  KEY ix_feat_category (category),
  CONSTRAINT fk_feat_module   FOREIGN KEY (module)   REFERENCES feature_modules (name),
  CONSTRAINT fk_feat_category FOREIGN KEY (category) REFERENCES feature_categories (name),
  CONSTRAINT fk_feat_status   FOREIGN KEY (status)   REFERENCES feature_statuses (name),
  CONSTRAINT fk_feat_priority FOREIGN KEY (priority) REFERENCES severity_levels (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE feature_applicable_segments (
  feature_id      VARCHAR(12)   NOT NULL,
  segment         VARCHAR(30)   NOT NULL,
  PRIMARY KEY (feature_id, segment),
  KEY ix_fas_segment (segment),
  CONSTRAINT fk_fas_feature FOREIGN KEY (feature_id) REFERENCES features (id) ON DELETE CASCADE,
  CONSTRAINT fk_fas_segment FOREIGN KEY (segment)    REFERENCES applicable_segments (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE feature_business_analysis (
  feature_id         VARCHAR(12)  NOT NULL,
  objective          TEXT         NULL,
  existing_workflow  TEXT         NULL,
  new_workflow       TEXT         NULL,
  benefits           TEXT         NULL,
  functional_req     TEXT         NULL,
  non_functional_req TEXT         NULL,
  dependencies       TEXT         NULL,
  assumptions        TEXT         NULL,
  PRIMARY KEY (feature_id),
  CONSTRAINT fk_fba_feature FOREIGN KEY (feature_id) REFERENCES features (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE feature_technical_analysis (
  feature_id       VARCHAR(12)  NOT NULL,
  db_changes       TEXT         NULL,
  tables           TEXT         NULL,
  stored_procs     TEXT         NULL,
  apis             TEXT         NULL,
  background_jobs  TEXT         NULL,
  reports          TEXT         NULL,
  mobile_changes   TEXT         NULL,
  portal_changes   TEXT         NULL,
  PRIMARY KEY (feature_id),
  CONSTRAINT fk_fta_feature FOREIGN KEY (feature_id) REFERENCES features (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE feature_workflows (
  feature_id          VARCHAR(12)  NOT NULL,
  decision_points     TEXT         NULL,
  alternate_flows     TEXT         NULL,
  exception_handling  TEXT         NULL,
  PRIMARY KEY (feature_id),
  CONSTRAINT fk_fw_feature FOREIGN KEY (feature_id) REFERENCES features (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE feature_workflow_steps (
  id              INT           NOT NULL AUTO_INCREMENT,
  feature_id      VARCHAR(12)   NOT NULL,
  seq             INT           NOT NULL,
  step_text       VARCHAR(200)  NOT NULL,
  PRIMARY KEY (id),
  KEY ix_fws_feature (feature_id),
  CONSTRAINT fk_fws_feature FOREIGN KEY (feature_id) REFERENCES feature_workflows (feature_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE feature_dev_details (
  feature_id        VARCHAR(12)   NOT NULL,
  project           VARCHAR(120)  NULL,
  branch            VARCHAR(120)  NULL,
  developer         VARCHAR(120)  NULL,
  start_date        VARCHAR(40)   NULL,
  completion_date   VARCHAR(40)   NULL,
  code_location     VARCHAR(200)  NULL,
  files_modified    TEXT          NULL,
  classes_modified  TEXT          NULL,
  apis_created      TEXT          NULL,
  sql_scripts       TEXT          NULL,
  PRIMARY KEY (feature_id),
  CONSTRAINT fk_fdd_feature FOREIGN KEY (feature_id) REFERENCES features (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE feature_impact (
  feature_id          VARCHAR(12)   NOT NULL,
  revenue_generated   VARCHAR(60)   NULL,
  time_saved          VARCHAR(60)   NULL,
  manual_work_reduced VARCHAR(120)  NULL,
  compliance          VARCHAR(160)  NULL,
  patient_experience  VARCHAR(160)  NULL,
  modules_affected    VARCHAR(160)  NULL,
  apis_changed        VARCHAR(120)  NULL,
  reports_changed     VARCHAR(120)  NULL,
  db_changes          VARCHAR(160)  NULL,
  PRIMARY KEY (feature_id),
  CONSTRAINT fk_fi_feature FOREIGN KEY (feature_id) REFERENCES features (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE feature_screen_changes (
  id              VARCHAR(10)   NOT NULL,          -- 'SCR-01'
  feature_id      VARCHAR(12)   NOT NULL,
  module          VARCHAR(30)   NULL,
  screen          VARCHAR(120)  NULL,
  menu_path       VARCHAR(160)  NULL,
  button_added    VARCHAR(120)  NULL,
  control         VARCHAR(120)  NULL,
  validation      VARCHAR(200)  NULL,
  user_rights     VARCHAR(160)  NULL,
  created_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY ix_fsc_feature (feature_id),
  CONSTRAINT fk_fsc_feature FOREIGN KEY (feature_id) REFERENCES features (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE feature_tests (
  id              VARCHAR(10)   NOT NULL,          -- 'FT-01'
  feature_id      VARCHAR(12)   NOT NULL,
  test_case       VARCHAR(200)  NOT NULL,
  tester          VARCHAR(120)  NULL,
  uat_status      VARCHAR(15)   NULL,             -- Passed | In Progress
  bugs            INT           NOT NULL DEFAULT 0,
  bug_fixes       INT           NOT NULL DEFAULT 0,
  qa_approval     VARCHAR(15)   NULL,             -- Approved | Pending
  client_uat      VARCHAR(15)   NULL,             -- Approved | Pending
  created_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY ix_ft_feature (feature_id),
  CONSTRAINT fk_ft_feature FOREIGN KEY (feature_id) REFERENCES features (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE feature_client_adoption (
  id              VARCHAR(10)   NOT NULL,          -- 'AD-01'
  feature_id      VARCHAR(12)   NOT NULL,
  client          VARCHAR(120)  NOT NULL,
  status          VARCHAR(15)   NULL,             -- Live | UAT | Planned
  go_live         DATE          NULL,
  version         VARCHAR(12)   NULL,
  environment     VARCHAR(10)   NULL,             -- Live | UAT | —
  deployed_by     VARCHAR(120)  NULL,
  created_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY ix_fca_feature (feature_id),
  KEY ix_fca_status (status),
  CONSTRAINT fk_fca_feature FOREIGN KEY (feature_id) REFERENCES features (id) ON DELETE CASCADE,
  CONSTRAINT ck_fca_status CHECK (status IN ('Live','UAT','Planned'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE feature_kb_docs (
  id              VARCHAR(10)   NOT NULL,          -- 'KB-01'
  feature_id      VARCHAR(12)   NOT NULL,
  name            VARCHAR(200)  NOT NULL,
  type            VARCHAR(30)   NULL,
  size            VARCHAR(20)   NULL,
  uploaded_by     VARCHAR(120)  NULL,
  uploaded_on     DATE          NULL,
  created_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY ix_fkb_feature (feature_id),
  CONSTRAINT fk_fkb_feature FOREIGN KEY (feature_id) REFERENCES features (id) ON DELETE CASCADE,
  CONSTRAINT fk_fkb_type    FOREIGN KEY (type)       REFERENCES kb_doc_types (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE feature_approvals (
  id              VARCHAR(10)   NOT NULL,          -- 'APR-01'
  feature_id      VARCHAR(12)   NOT NULL,
  module          VARCHAR(30)   NULL,
  priority        VARCHAR(10)   NULL,
  requested_by    VARCHAR(120)  NULL,
  request_date    DATE          NULL,
  impact_score    DECIMAL(3,1)  NULL,
  stage           VARCHAR(30)   NULL,             -- Business Review | Technical Review | Head Approval
  decision        VARCHAR(15)   NULL,             -- Approved | Pending
  approver        VARCHAR(120)  NULL,
  created_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY ix_fapr_feature (feature_id),
  KEY ix_fapr_decision (decision),
  CONSTRAINT fk_fapr_feature  FOREIGN KEY (feature_id) REFERENCES features (id) ON DELETE CASCADE,
  CONSTRAINT fk_fapr_priority FOREIGN KEY (priority)   REFERENCES severity_levels (name),
  CONSTRAINT ck_fapr_stage    CHECK (stage IN ('Business Review','Technical Review','Head Approval')),
  CONSTRAINT ck_fapr_decision CHECK (decision IN ('Approved','Pending'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================================
-- 7. DASHBOARD CONTENT (editable widget data; KPIs/mixes/trends are COMPUTED
--    by the API, not stored)
-- ============================================================================

CREATE TABLE notifications (
  id              INT           NOT NULL,
  type            VARCHAR(20)   NOT NULL,          -- approval | alert | task | system | info
  title           VARCHAR(160)  NOT NULL,
  description     VARCHAR(255)  NULL,
  time_label      VARCHAR(40)   NULL,
  unread          TINYINT(1)    NOT NULL DEFAULT 1,
  created_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT ck_notif_type CHECK (type IN ('approval','alert','task','system','info'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE activity_feed (
  id              INT           NOT NULL,
  who             VARCHAR(120)  NOT NULL,
  action          VARCHAR(120)  NULL,
  target          VARCHAR(160)  NULL,
  time_label      VARCHAR(40)   NULL,
  color           VARCHAR(40)   NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE upcoming_events (
  id              INT           NOT NULL,
  kind            VARCHAR(20)   NOT NULL,          -- meeting | uat | golive | training
  title           VARCHAR(160)  NOT NULL,
  date            DATE          NULL,
  time_label      VARCHAR(20)   NULL,
  tint            VARCHAR(16)   NULL,
  PRIMARY KEY (id),
  CONSTRAINT ck_upcoming_kind CHECK (kind IN ('meeting','uat','golive','training'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
