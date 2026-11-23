CREATE TABLE companies (
 id text PRIMARY KEY CHECK (id ~ '^[a-f0-9]{32}$'), name text NOT NULL CHECK (char_length(name) BETWEEN 2 AND 160 AND name = btrim(name)),
 employer_type text NOT NULL CHECK (employer_type IN ('Private company','NGO','Government')),
 version bigint NOT NULL DEFAULT 1 CHECK (version > 0), created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX companies_name_unique ON companies(lower(name));
CREATE TABLE accounts (
 id text PRIMARY KEY CHECK (id ~ '^[a-f0-9]{32}$'), email text NOT NULL UNIQUE CHECK (email = lower(email)),
 password_hash text NOT NULL, role text NOT NULL CHECK (role IN ('super_admin','recruiter','company_admin')),
 company_id text REFERENCES companies(id), active boolean NOT NULL DEFAULT true, totp_secret bytea, last_counter bigint NOT NULL DEFAULT -1,
 CHECK ((role='company_admin' AND company_id IS NOT NULL) OR (role<>'company_admin' AND company_id IS NULL))
);
CREATE UNIQUE INDEX one_initial_super_admin ON accounts ((role)) WHERE role='super_admin';
CREATE TABLE sessions (
 token_hash bytea PRIMARY KEY CHECK (octet_length(token_hash)=32), csrf text NOT NULL,
 account_id text REFERENCES accounts(id) ON DELETE CASCADE, phase text NOT NULL CHECK (phase IN ('anonymous','pending','full')),
 expires_at timestamptz NOT NULL, touched_at timestamptz NOT NULL, enrollment bytea, attempts integer NOT NULL DEFAULT 0 CHECK (attempts>=0),
 CHECK ((phase='anonymous' AND account_id IS NULL) OR (phase<>'anonymous' AND account_id IS NOT NULL))
);
CREATE INDEX sessions_expiry ON sessions(expires_at);
CREATE TABLE recovery_codes (account_id text NOT NULL REFERENCES accounts(id) ON DELETE CASCADE, code_hash bytea NOT NULL CHECK(octet_length(code_hash)=32), PRIMARY KEY(account_id,code_hash));
CREATE TABLE auth_limits (key_hash bytea PRIMARY KEY CHECK(octet_length(key_hash)=32), window_start timestamptz NOT NULL, attempts integer NOT NULL CHECK(attempts>0));
CREATE TABLE managed_lists (id text PRIMARY KEY, kind text NOT NULL CHECK(kind IN ('category','location')), label text NOT NULL, UNIQUE(kind,label), UNIQUE(id,kind));
INSERT INTO managed_lists(id,kind,label) VALUES
 ('cat-health','category','Health and Medicine'),('cat-education','category','Education and Training'),('cat-ict','category','ICT and Technology'),('cat-finance','category','Finance and Accounting'),('cat-admin','category','Administration and Office'),('cat-engineering','category','Engineering and Construction'),('cat-ngo','category','NGO Humanitarian and Development'),('cat-legal','category','Legal and Governance'),('cat-logistics','category','Logistics and Transport'),('cat-hospitality','category','Hospitality and Tourism'),('cat-sales','category','Sales Marketing and Media'),('cat-agriculture','category','Agriculture and Environment'),('cat-security','category','Security'),('cat-other','category','Other'),
 ('loc-mogadishu','location','Mogadishu'),('loc-hargeisa','location','Hargeisa'),('loc-garowe','location','Garowe'),('loc-kismayo','location','Kismayo'),('loc-baidoa','location','Baidoa'),('loc-beledweyne','location','Beledweyne'),('loc-galkayo','location','Galkayo'),('loc-bosaso','location','Bosaso'),('loc-berbera','location','Berbera'),('loc-burao','location','Burao'),('loc-jowhara','location','Jowhara'),('loc-remote','location','Remote'),('loc-other','location','Other');
CREATE TABLE jobs (
 id text PRIMARY KEY CHECK (id ~ '^[a-f0-9]{32}$'), company_id text NOT NULL REFERENCES companies(id), slug text NOT NULL UNIQUE CHECK(slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
 title text NOT NULL CHECK(char_length(title) BETWEEN 3 AND 160), description text NOT NULL,
 location_id text NOT NULL, category_id text NOT NULL,
 location_kind text NOT NULL DEFAULT 'location' CHECK(location_kind='location'), category_kind text NOT NULL DEFAULT 'category' CHECK(category_kind='category'),
 job_type text NOT NULL CHECK(job_type IN ('Full-time','Contract','Part-time')), arrangement text NOT NULL CHECK(arrangement IN ('On-site','Hybrid','Remote')),
 status text NOT NULL CHECK(status IN ('draft','published','archived')) DEFAULT 'draft',
 application_method text NOT NULL CHECK(application_method IN ('Company website','Email','WhatsApp','Dalka recruitment')),
 destination text NOT NULL DEFAULT '', posted_at timestamptz NOT NULL DEFAULT now(), closes_at timestamptz NOT NULL,
 CHECK(application_method<>'Dalka recruitment' OR destination=''),
 FOREIGN KEY(location_id,location_kind) REFERENCES managed_lists(id,kind), FOREIGN KEY(category_id,category_kind) REFERENCES managed_lists(id,kind)
);
CREATE INDEX jobs_published ON jobs(posted_at DESC,id DESC) WHERE status='published';
CREATE INDEX jobs_company ON jobs(company_id);
