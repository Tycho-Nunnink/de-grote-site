
-- @block
CREATE TABLE Users(
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(255) NOT NULL UNIQUE,
    pswdhash VARCHAR(255) NOT NULL,
    cookie VARCHAR(255) UNIQUE
);

-- @block
INSERT INTO users (username, pswdhash)
VALUES ( "test", "boem")

-- @block
SELECT * FROM users;

-- @block
drop TABLE Users

--@block 
DELETE FROM Users