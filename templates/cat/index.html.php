<?php

/** @var \App\Model\Cat[] $cats */
/** @var \App\Service\Router $router */

$title = 'Cat List';
$bodyClass = 'index';

ob_start(); ?>
    <h1>Cat List</h1>

    <a href="/?action=cat-create">Add new cat</a>

    <ul class="index-list">
        <?php foreach ($cats as $cat): ?>
            <li><h3><?= htmlspecialchars($cat['name']) ?></h3>
                <ul class="action-list">
                    <li><a href="/?action=cat-show&id=<?= $cat['id'] ?>">Details</a></li>
                    <li><a href="/?action=cat-edit&id=<?= $cat['id'] ?>">Edit</a></li>
                </ul>
            </li>
        <?php endforeach; ?>
    </ul>

<?php $main = ob_get_clean();

include __DIR__ . DIRECTORY_SEPARATOR . '..' . DIRECTORY_SEPARATOR . 'base.html.php';