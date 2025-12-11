<?php

/** @var array $cat */
/** @var \App\Service\Router $router */

$title = 'Edit Cat: ' . htmlspecialchars($cat['name']);
$bodyClass = 'edit';

ob_start(); ?>
    <h1>Edit Cat</h1>

<?php if (!empty($cat['image'])): ?>
    <p>Current image:</p>
    <img src="<?= htmlspecialchars($cat['image']) ?>" alt="<?= htmlspecialchars($cat['name']) ?>" style="max-width: 200px; height: auto;">
<?php endif; ?>

    <form action="/?action=cat-edit&id=<?= $cat['id'] ?>" method="post" enctype="multipart/form-data" class="edit-form">
        <label>
            Name
            <input type="text" name="name" value="<?= htmlspecialchars($cat['name']) ?>" required>
        </label>
        <br>
        <label>
            Breed
            <input type="text" name="breed" value="<?= htmlspecialchars($cat['breed']) ?>" required>
        </label>
        <br>
        <label>
            Age
            <input type="number" name="age" min="0" max="30" value="<?= htmlspecialchars($cat['age']) ?>" required>
        </label>
        <br>
        <label>
            Description
            <textarea name="description" rows="5"><?= htmlspecialchars($cat['description']) ?></textarea>
        </label>
        <br>
        <label>
            Change Image
            <input type="file" name="image" accept="image/*">
        </label>
        <br>
        <ul class="action-list">
            <li><a href="/?action=cat-show&id=<?= $cat['id'] ?>">Cancel</a></li>
            <li><button type="submit">Submit</button></li>
        </ul>
    </form>

<?php $main = ob_get_clean();

include __DIR__ . DIRECTORY_SEPARATOR . '..' . DIRECTORY_SEPARATOR . 'base.html.php';