<?php

/** @var \App\Service\Router $router */

$title = 'Add New Cat';
$bodyClass = 'edit';

ob_start(); ?>
    <h1>Add New Cat</h1>

    <form action="/?action=cat-create" method="post" enctype="multipart/form-data" class="edit-form">
        <label>
            Name
            <input type="text" name="name" required>
        </label>
        <br>
        <label>
            Breed
            <input type="text" name="breed" required>
        </label>
        <br>
        <label>
            Age
            <input type="number" name="age" min="0" max="30" required>
        </label>
        <br>
        <label>
            Description
            <textarea name="description" rows="5"></textarea>
        </label>
        <br>
        <label>
            Image
            <input type="file" name="image" accept="image/*">
        </label>
        <br>
        <ul class="action-list">
            <li><a href="/?action=cat-index">Cancel</a></li>
            <li><button type="submit">Submit</button></li>
        </ul>
    </form>

<?php $main = ob_get_clean();

include __DIR__ . DIRECTORY_SEPARATOR . '..' . DIRECTORY_SEPARATOR . 'base.html.php';