<?php

namespace App\Controller;

use App\Model\Cat;
use App\Service\Router;
use App\Service\Templating;

class CatController
{
    public function indexAction(Templating $templating, Router $router): ?string
    {
        $cats = Cat::findAll();
        $html = $templating->render('cat/index.html.php', [
            'cats' => $cats,
            'router' => $router,
        ]);
        return $html;
    }

    public function createAction(Templating $templating, Router $router): ?string
    {
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $name = $_POST['name'] ?? '';
            $breed = $_POST['breed'] ?? '';
            $age = $_POST['age'] ?? '';
            $description = $_POST['description'] ?? '';
            $imagePath = null;

            if (!empty($name) && !empty($breed) && !empty($age)) {
                if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
                    $uploadDir = __DIR__ . '/../../public/uploads/cats/';
                    $fileExtension = pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION);
                    $fileName = uniqid('cat_') . '.' . $fileExtension;
                    $uploadFile = $uploadDir . $fileName;

                    if (move_uploaded_file($_FILES['image']['tmp_name'], $uploadFile)) {
                        $imagePath = '/uploads/cats/' . $fileName;
                    }
                }

                Cat::create([
                    'name' => $name,
                    'breed' => $breed,
                    'age' => (int)$age,
                    'description' => $description,
                    'image' => $imagePath
                ]);

                $router->redirect('/?action=cat-index');
            }
        }

        return $templating->render('cat/create.html.php', ['router' => $router]);
    }

    public function showAction(Templating $templating, Router $router): ?string
    {
        $id = (int)($_GET['id'] ?? 0);
        $cat = Cat::findById($id);

        if (!$cat) {
            $router->redirect('/?action=cat-index');
            return null;
        }

        return $templating->render('cat/show.html.php', [
            'cat' => $cat,
            'router' => $router,
        ]);
    }

    public function editAction(Templating $templating, Router $router): ?string
    {
        $id = (int)($_GET['id'] ?? 0);
        $cat = Cat::findById($id);

        if (!$cat) {
            $router->redirect('/?action=cat-index');
            return null;
        }

        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $name = $_POST['name'] ?? '';
            $breed = $_POST['breed'] ?? '';
            $age = $_POST['age'] ?? '';
            $description = $_POST['description'] ?? '';
            $imagePath = $cat['image'];

            if (!empty($name) && !empty($breed) && !empty($age)) {
                if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
                    $uploadDir = __DIR__ . '/../../public/uploads/cats/';
                    $fileExtension = pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION);
                    $fileName = uniqid('cat_') . '.' . $fileExtension;
                    $uploadFile = $uploadDir . $fileName;

                    if (move_uploaded_file($_FILES['image']['tmp_name'], $uploadFile)) {
                        $imagePath = '/uploads/cats/' . $fileName;
                    }
                }

                Cat::update($id, [
                    'name' => $name,
                    'breed' => $breed,
                    'age' => (int)$age,
                    'description' => $description,
                    'image' => $imagePath
                ]);

                $router->redirect('/?action=cat-show&id=' . $id);
            }
        }

        return $templating->render('cat/edit.html.php', [
            'cat' => $cat,
            'router' => $router,
        ]);
    }

    public function deleteAction(Router $router): ?string
    {
        $id = (int)($_POST['id'] ?? 0);

        if ($id > 0) {
            Cat::delete($id);
        }

        $router->redirect('/?action=cat-index');
        return null;
    }
}