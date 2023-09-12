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

        ----------
        CREATE TABLE encounter (
            id UUID NOT NULL,
            advocate_id UUID NOT NULL,
            client_id UUID NOT NULL,
            initiated_by_advocate BOOLEAN NOT NULL DEFAULT false,
            started_at TIMESTAMP WITH TIME ZONE NOT NULL,
            completed_at TIMESTAMP WITH TIME ZONE,
            created_at TIMESTAMP WITH TIME ZONE NOT NULL,
            updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
            deleted boolean NOT NULL DEFAULT false,
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

        ----------
        CREATE TABLE encounter_note (
            id UUID NOT NULL,
            encounter_id UUID NOT NULL,
            type INT NOT NULL DEFAULT 1,  -- Direct message
            message TEXT,
            submitted_at TIMESTAMP WITH TIME ZONE,
            advocate_read_at TIMESTAMP WITH TIME ZONE,
            client_read_at TIMESTAMP WITH TIME ZONE,
            created_at TIMESTAMP WITH TIME ZONE NOT NULL,
            updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
            deleted boolean NOT NULL DEFAULT false,
            CONSTRAINT encounter_note_pkey PRIMARY KEY (id),
            CONSTRAINT fk__encounter_note__encounter FOREIGN KEY (encounter_id)
                REFERENCES encounter (id) MATCH SIMPLE
                ON UPDATE NO ACTION
                ON DELETE NO ACTION
        );


        ----------
        INSERT INTO user_ (
            id, name, created_at, updated_at
        ) VALUES (
            'acf4adb2-1397-47a7-92ae-8336b22556e6',
            'Caregiving Cathy',
            '2023-09-11 21:15:38-04',
            '2023-09-11 21:15:38-04'
        );

        ----------
        INSERT INTO user_ (
            id, name, created_at, updated_at
        ) VALUES (
            'a0bc7321-899c-421c-87b6-e0e1a9524076',
            'Ailment Amy',
            '2023-09-11 21:15:38-04',
            '2023-09-11 21:15:38-04'
        );

        INSERT INTO encounter (
            id, advocate_id, client_id, started_at, created_at, updated_at
        ) VALUES (
            '77624181-1fe3-4fc6-9f37-99a0363cb20a',
            'acf4adb2-1397-47a7-92ae-8336b22556e6',
            'a0bc7321-899c-421c-87b6-e0e1a9524076',
            '2023-09-11 21:15:38-04',
            '2023-09-11 21:15:38-04',
            '2023-09-11 21:15:38-04'
        );

        INSERT INTO encounter_note (
            id, encounter_id, type, message, submitted_at, created_at, updated_at
        ) VALUES (
            'c3d6a118-4125-4851-ba23-a511e861259c',
            '77624181-1fe3-4fc6-9f37-99a0363cb20a',
            1,  -- Direct message
            'Hey there. Can you help me? I don\'\'t feel so good.',
            '2023-09-11 21:15:38-04',
            '2023-09-11 21:15:38-04',
            '2023-09-11 21:15:38-04'
        );

        ----------
        INSERT INTO user_ (
            id, name, created_at, updated_at
        ) VALUES (
            '4b7ca888-6716-457f-bdc2-eb759764c4a9',
            'Broken Bill',
            '2023-09-11 21:15:38-04',
            '2023-09-11 21:15:38-04'
        );

        INSERT INTO encounter (
            id, advocate_id, client_id, started_at, created_at, updated_at
        ) VALUES (
            '912b509a-d62e-46b5-960f-6848dc8fb08b',
            'acf4adb2-1397-47a7-92ae-8336b22556e6',
            '4b7ca888-6716-457f-bdc2-eb759764c4a9',
            '2023-09-12 10:15:38-04',
            '2023-09-12 10:15:38-04',
            '2023-09-12 10:15:38-04'
        );

        INSERT INTO encounter_note (
            id, encounter_id, type, message, submitted_at, created_at, updated_at
        ) VALUES (
            '261a8fea-c8f0-4fbe-8447-f157ac013666',
            '912b509a-d62e-46b5-960f-6848dc8fb08b',
            1,  -- Direct message
            'It hurts when I hit my head like this. Can you help?',
            '2023-09-12 10:15:38-04',
            '2023-09-12 10:15:38-04',
            '2023-09-12 10:15:38-04'
        );

    `,
    //----------------------------------------
    down: `

        DROP TABLE encounter_note;
        DROP TABLE encounter;
        DROP TABLE user_;

    `
};
