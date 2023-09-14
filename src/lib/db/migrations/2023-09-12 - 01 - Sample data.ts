import { MigrationScript } from "./_allMigrations";
export const script: MigrationScript = {
up: `

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
    id, advocate_id, client_id, summary, started_at, created_at, updated_at
) VALUES (
    '77624181-1fe3-4fc6-9f37-99a0363cb20a',
    'acf4adb2-1397-47a7-92ae-8336b22556e6',
    'a0bc7321-899c-421c-87b6-e0e1a9524076',
    'Initial inquiry',
    '2023-09-11 21:15:38-04',
    '2023-09-11 21:15:38-04',
    '2023-09-11 21:15:38-04'
);

INSERT INTO encounter_note (
    id, encounter_id, submitted_by_id, type, message, personal, submitted_at, created_at, updated_at
) VALUES (
    'c3d6a118-4125-4851-ba23-a511e861259c',
    '77624181-1fe3-4fc6-9f37-99a0363cb20a',
    'a0bc7321-899c-421c-87b6-e0e1a9524076',
    1,  -- Direct message
    'Hey there. Can you help me?\n\nI don\'\'t *feel* so good.',
    FALSE,
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
    id, advocate_id, client_id, summary, started_at, created_at, updated_at
) VALUES (
    '912b509a-d62e-46b5-960f-6848dc8fb08b',
    'acf4adb2-1397-47a7-92ae-8336b22556e6',
    '4b7ca888-6716-457f-bdc2-eb759764c4a9',
    'Initial inquiry',
    '2023-09-12 10:15:38-04',
    '2023-09-12 10:15:38-04',
    '2023-09-12 10:15:38-04'
);

INSERT INTO encounter_note (
    id, encounter_id, submitted_by_id, type, message, personal, submitted_at, created_at, updated_at
) VALUES (
    '261a8fea-c8f0-4fbe-8447-f157ac013666',
    '912b509a-d62e-46b5-960f-6848dc8fb08b',
    '4b7ca888-6716-457f-bdc2-eb759764c4a9',
    1,  -- Direct message
    'It hurts when I hit my head like this.\n\nCan you help?',
    FALSE,
    '2023-09-12 10:15:38-04',
    '2023-09-12 10:15:38-04',
    '2023-09-12 10:15:38-04'
);

----------
INSERT INTO encounter (
    id, advocate_id, client_id, summary, started_at, created_at, updated_at
) VALUES (
    'd97b629d-55e8-4534-bfd6-7ae71dec5877',
    'acf4adb2-1397-47a7-92ae-8336b22556e6',
    '4b7ca888-6716-457f-bdc2-eb759764c4a9',
    'Something happened',
    '2023-09-13 10:15:38-04',
    '2023-09-13 10:15:38-04',
    '2023-09-13 10:15:38-04'
);

INSERT INTO encounter_note (
    id, encounter_id, submitted_by_id, type, message, personal, submitted_at, created_at, updated_at
) VALUES (
    '8e966b88-f2d5-43dc-a770-12cdf719a87b',
    'd97b629d-55e8-4534-bfd6-7ae71dec5877',
    'acf4adb2-1397-47a7-92ae-8336b22556e6',
    2,  -- Case note
    'I dont\'\' know what. But something happened.',
    TRUE,
    '2023-09-13 10:15:38-04',
    '2023-09-13 10:15:38-04',
    '2023-09-13 10:15:38-04'
);

`,
//################################################################################
down: `

DELETE FROM encounter_note;
DELETE FROM encounter;
DELETE FROM user_;

`};
