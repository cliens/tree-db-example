SELECT * FROM projects
INNER JOIN users ON projects.userId = users.id
AND users.active = true