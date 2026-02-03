<?php
$pageName  = pathinfo($_SERVER['PHP_SELF'], PATHINFO_FILENAME);
$pageTitle = ucwords(str_replace(['-', '_'], ' ', $pageName));
?>
<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <title><?= $pageTitle ?> — 8INF886</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">

  <link rel="stylesheet" href="style/style.css">
  <link rel="stylesheet" href="style/<?= $pageName ?>.css">
</head>

<body>
  <?php include 'header.php'; ?>

  <main>
    <section class="card">
      <h1><?= $pageTitle ?></h1>
    </section>
  </main>

  <?php include 'footer.php'; ?>

  <script src="js/<?= $pageName ?>.js"></script>
</body>
</html>
