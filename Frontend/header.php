<?php
$current = basename($_SERVER['PHP_SELF']);
function is_active($file, $current) { return $file === $current ? 'is-active' : ''; }
?>
<header>
  <div class="header-inner">
    <div class="brand">
      <img src="logo.png" alt="UQAC" />
    </div>

    <nav class="nav" aria-label="Navigation principale">
      <a class="<?= is_active('index.php', $current) ?>" href="index.php">Home</a>
      <a class="<?= is_active('acceptation.php', $current) ?>" href="acceptation.php">Acceptation</a>
      <a class="<?= is_active('obligatoire.php', $current) ?>" href="obligatoire.php">Obligatoire</a>
      <a class="<?= is_active('pixel.php', $current) ?>" href="pixel.php">Pixel</a>
      <a class="<?= is_active('politique.php', $current) ?>" href="politique.php">Politique</a>
      <a class="<?= is_active('exemple1.php', $current) ?>" href="exemple1.php">Exemple1</a>
      <a class="<?= is_active('exemple2.php', $current) ?>" href="exemple2.php">Exemple2</a>
    </nav>
  </div>
</header>
