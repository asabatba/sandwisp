
exports.up = function (knex) {
    return knex.schema//.withSchema('sandwisp')
        .createTable('album_tracks', (table) => {
            table.string('id').notNullable();
            table.string('track_id').notNullable();
            table.integer('disc_number');
            table.integer('track_number');
            table.primary(['id', 'track_id']);
        })
        .createTable('audio_analysis', (table) => {
            table.string('id').notNullable().primary();
            table.jsonb('meta');
            table.jsonb('track');
            table.jsonb('bars');
            table.jsonb('beats');
            table.jsonb('sections');
            table.jsonb('segments');
            table.jsonb('tatums');
        })
        .createTable('audio_features', (table) => {
            table.string('id').notNullable().primary();
            table.jsonb('data');
        })
        .createTable('colors', (table) => {
            table.string('id').notNullable();
            table.string('type').notNullable();
            table.jsonb('colors');
            table.primary(['id', 'type']);
        })
        .createTable('playlist_tracks', (table) => {
            table.string('id').notNullable();
            table.string('track_id').notNullable();
            table.integer('track_order').notNullable();
            table.timestamp('added_at');
            table.primary(['id', 'track_id']);
        })
        .createTable('track_info', (table) => {
            table.string('id').notNullable().primary();
            table.jsonb('data');
        });
};

exports.down = function (knex) {
    return knex.schema//.withSchema('sandwisp')
        .dropTable('album_tracks')
        .dropTable('audio_analysis')
        .dropTable('audio_features')
        .dropTable('colors')
        .dropTable('playlist_tracks')
        .dropTable('track_info');
};
