import { MigrationScript } from "./_allMigrations";
export const script: MigrationScript = {
up: `

----------
CREATE TABLE user_ (
    id UUID NOT NULL,
    name CHARACTER VARYING(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    deleted BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT user_pkey PRIMARY KEY (id)
);

COMMENT ON TABLE user_ IS
'Users are people who can log in and do stuff';

CREATE UNIQUE INDEX IF NOT EXISTS ix__user__name
ON user_ (name);

----------
CREATE TABLE encounter (
    id UUID NOT NULL,
    advocate_id UUID NOT NULL,
    client_id UUID NOT NULL,
    summary TEXT,
    status INT NOT NULL DEFAULT 0,
    initiated_by_advocate BOOLEAN NOT NULL DEFAULT false,
    started_at TIMESTAMP WITH TIME ZONE NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    deleted BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT encounter_pkey PRIMARY KEY (id),
    CONSTRAINT fk__encounter__advocate FOREIGN KEY (advocate_id)
        REFERENCES user_ (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT fk__encounter__client FOREIGN KEY (client_id)
        REFERENCES user_ (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
);

COMMENT ON TABLE encounter IS
'An encounter is an appointment, stay, or other continuous event involving advocate and client';

CREATE INDEX IF NOT EXISTS ix__encounter__advocate_id
ON encounter (advocate_id);

CREATE INDEX IF NOT EXISTS ix__encounter__client_id
ON encounter (client_id);

CREATE INDEX IF NOT EXISTS ix__encounter__summary
ON encounter (summary);

CREATE INDEX IF NOT EXISTS ix__encounter__started_at
ON encounter (started_at);

----------
CREATE TABLE encounter_note (
    id UUID NOT NULL,
    encounter_id UUID NOT NULL,
    type INT NOT NULL DEFAULT 1,  -- Direct message
    message TEXT,
    personal BOOLEAN DEFAULT FALSE,
    submitted_at TIMESTAMP WITH TIME ZONE,
    submitted_by_id UUID NOT NULL,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    deleted BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT encounter_note_pkey PRIMARY KEY (id),
    CONSTRAINT fk__encounter_note__submitted_by_id FOREIGN KEY (submitted_by_id)
        REFERENCES user_ (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT fk__encounter_note__encounter FOREIGN KEY (encounter_id)
        REFERENCES encounter (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
);

COMMENT ON TABLE encounter_note IS
'Each encounter will typically have one or more direct messages or other notes attached';

CREATE INDEX IF NOT EXISTS ix__encounter_note__encounter_id
ON encounter_note (encounter_id);

CREATE INDEX IF NOT EXISTS ix__encounter_note__submitted_at
ON encounter_note (submitted_at);

`,
//################################################################################
down: `

DROP TABLE encounter_note;
DROP TABLE encounter;
DROP TABLE user_;

`};
