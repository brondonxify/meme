-- Create Specification Table
CREATE TABLE IF NOT EXISTS specification (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
) ENGINE=InnoDB;

-- Create Pivot Table for Article and Specifications
CREATE TABLE IF NOT EXISTS article_specification (
    article_id INT NOT NULL,
    specification_id INT NOT NULL,
    PRIMARY KEY (article_id, specification_id),
    CONSTRAINT fk_spec_article FOREIGN KEY (article_id) REFERENCES article(id) ON DELETE CASCADE,
    CONSTRAINT fk_spec_def FOREIGN KEY (specification_id) REFERENCES specification(id) ON DELETE CASCADE
) ENGINE=InnoDB;
