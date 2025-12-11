<?php

namespace App\Model;

use PDO;

class Cat
{
    private static function getConnection(): PDO
    {
        $config = require __DIR__ . '/../../config/config.php';
        return new PDO($config['db_dsn'], $config['db_user'], $config['db_pass']);
    }

    public static function findAll(): array
    {
        $pdo = self::getConnection();
        $stmt = $pdo->query('SELECT * FROM cat ORDER BY created_at DESC');
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public static function findById(int $id): ?array
    {
        $pdo = self::getConnection();
        $stmt = $pdo->prepare('SELECT * FROM cat WHERE id = :id');
        $stmt->execute(['id' => $id]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        return $result ?: null;
    }

    public static function create(array $data): bool
    {
        $pdo = self::getConnection();
        $stmt = $pdo->prepare('
            INSERT INTO cat (name, breed, age, description, image) 
            VALUES (:name, :breed, :age, :description, :image)
        ');
        return $stmt->execute([
            'name' => $data['name'],
            'breed' => $data['breed'],
            'age' => $data['age'],
            'description' => $data['description'] ?? null,
            'image' => $data['image'] ?? null
        ]);
    }

    public static function update(int $id, array $data): bool
    {
        $pdo = self::getConnection();
        $stmt = $pdo->prepare('
            UPDATE cat 
            SET name = :name, breed = :breed, age = :age, description = :description, image = :image, updated_at = CURRENT_TIMESTAMP
            WHERE id = :id
        ');
        return $stmt->execute([
            'id' => $id,
            'name' => $data['name'],
            'breed' => $data['breed'],
            'age' => $data['age'],
            'description' => $data['description'] ?? null,
            'image' => $data['image'] ?? null
        ]);
    }

    public static function delete(int $id): bool
    {
        $pdo = self::getConnection();
        $stmt = $pdo->prepare('DELETE FROM cat WHERE id = :id');
        return $stmt->execute(['id' => $id]);
    }
}