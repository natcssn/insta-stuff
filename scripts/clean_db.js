const Database = require('better-sqlite3');
const db = new Database('bot_data.sqlite');
const res = db.prepare("DELETE FROM processed_comments WHERE comment_id LIKE 'comment_test%' OR username = 'test' OR username = 'thenatrants'").run();
console.log('Deleted dummy rows:', res.changes);
const stats = db.prepare("SELECT COUNT(*) as total, SUM(CASE WHEN dm_sent = 1 THEN 1 ELSE 0 END) as dms FROM processed_comments").get();
console.log('Real stats now:', stats);
