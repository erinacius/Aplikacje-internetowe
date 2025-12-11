<?php

/** @var array $cat */
/** @var \App\Service\Router $router */

$title = htmlspecialchars($cat['name']);
$bodyClass = 'show';

ob_start(); ?>
    <h1><?= htmlspecialchars($cat['name']) ?></h1>

<?php if (!empty($cat['image'])): ?>
    <img src="<?= htmlspecialchars($cat['image']) ?>" alt="<?= htmlspecialchars($cat['name']) ?>" style="max-width: 400px; height: auto;">
<?php endif; ?>

    <article>
        <p><strong>Breed:</strong> <?= htmlspecialchars($cat['breed']) ?></p>
        <p><strong>Age:</strong> <?= htmlspecialchars($cat['age']) ?> years</p>
        <p><strong>Description:</strong> <?= nl2br(htmlspecialchars($cat['description'])) ?></p>
        <p><strong>Added:</strong> <?= htmlspecialchars($cat['created_at']) ?></p>
    </article>

    <ul class="action-list">
        <li><a href="/?action=cat-index">Back to list</a></li>
        <li><a href="/?action=cat-edit&id=<?= $cat['id'] ?>">Edit</a></li>
        <li>
            <form method="post" action="/?action=cat-delete">
                <input type="hidden" name="id" value="<?= $cat['id'] ?>">
                <button type="submit">Delete</button>
            </form>
        </li>
    </ul>

<?php $main = ob_get_clean();

include __DIR__ . DIRECTORY_SEPARATOR . '..' . DIRECTORY_SEPARATOR . 'base.html.php';