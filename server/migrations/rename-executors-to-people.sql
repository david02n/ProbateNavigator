-- Rename table & sequence
ALTER TABLE executors RENAME TO people;
ALTER SEQUENCE executors_id_seq RENAME TO people_id_seq;
ALTER TABLE people ALTER COLUMN id SET DEFAULT nextval('people_id_seq');

-- Ensure all columns exist (add any missing)
ALTER TABLE people 
  ADD COLUMN IF NOT EXISTS title           VARCHAR(10),
  ADD COLUMN IF NOT EXISTS first_names     VARCHAR(255),
  ADD COLUMN IF NOT EXISTS middle_names    VARCHAR(255),
  ADD COLUMN IF NOT EXISTS last_name       VARCHAR(255),
  ADD COLUMN IF NOT EXISTS person_position SMALLINT DEFAULT 1,
  ADD COLUMN IF NOT EXISTS executor        BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS is_applicant    BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS is_notifying    BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS needs_more_info BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS status          VARCHAR(50) DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS address_line1   VARCHAR(255),
  ADD COLUMN IF NOT EXISTS address_line2   VARCHAR(255),
  ADD COLUMN IF NOT EXISTS city            VARCHAR(100),
  ADD COLUMN IF NOT EXISTS county          VARCHAR(100),
  ADD COLUMN IF NOT EXISTS postcode        VARCHAR(20),
  ADD COLUMN IF NOT EXISTS phone_home      VARCHAR(50),
  ADD COLUMN IF NOT EXISTS phone_mobile    VARCHAR(50),
  ADD COLUMN IF NOT EXISTS name_diff_will  BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS alt_name_will   VARCHAR(255);

-- Migrate legacy data 
UPDATE people
SET
  first_names   = COALESCE(first_names, first_name),
  last_name     = COALESCE(last_name, last_name),
  address_line1 = COALESCE(address_line1, address),
  postcode      = COALESCE(postcode, post_code),
  phone_home    = COALESCE(phone_home, phone),
  executor      = is_executor;

-- Add constraints and indexes
ALTER TABLE people 
  ADD CONSTRAINT IF NOT EXISTS uq_case_position UNIQUE(case_id, person_position);

CREATE INDEX IF NOT EXISTS idx_people_executor ON people(case_id) 
  WHERE executor;