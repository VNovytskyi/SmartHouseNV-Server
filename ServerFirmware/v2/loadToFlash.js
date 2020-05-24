let data = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>SmartHouseNV</title>
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous">
	<script src="https://kit.fontawesome.com/052fa37aec.js" crossorigin="anonymous"></script>
	<link rel="stylesheet" href="style.css">
</head>
<body class="pt-5">
	<!-- <nav aria-label="breadcrumb" class="fixed-top">
		<ol class="breadcrumb">
			<li class="breadcrumb-item"><a href="#bedroom">Спальня</a></li>
			<li class="breadcrumb-item"><a href="#hall">Прихожая</a></li>
			<li class="breadcrumb-item"><a href="#bathroom">Санузел</a></li>
			<li class="breadcrumb-item"><a href="#kitchen">Кухня</a></li>
		</ol>
		<p>Hello</p>
	</nav> -->
	
	<nav class="navbar navbar-expand-md navbar-dark fixed-top bg-dark">
		<a class="navbar-brand" href="#">SmartHouseNV</a>
		<button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarsExampleDefault" aria-controls="navbarsExampleDefault" aria-expanded="false" aria-label="Toggle navigation">
		  <span class="navbar-toggler-icon"></span>
		</button>
  
		<div class="collapse navbar-collapse" id="navbarsExampleDefault">
			<ul class="navbar-nav mr-auto">
				<li class="nav-item active">
					<a class="nav-link " href="#">Спальня<span class="sr-only">(current)</span></a>
				</li>
				<li class="nav-item active">
				  	<a class="nav-link" href="#">Коридор<span class="sr-only">(current)</span></a>
				</li>
				<li class="nav-item active">
				  	<a class="nav-link" href="#">Ванная<span class="sr-only">(current)</span></a>
				</li>
				<li class="nav-item active">
				  	<a class="nav-link" href="#">Кухня<span class="sr-only">(current)</span></a>
				</li>
				
				<li class="nav-item dropdown">
				  <a class="nav-link dropdown-toggle" href="http://example.com" id="dropdown01" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">Другое</a>
				  <div class="dropdown-menu" aria-labelledby="dropdown01">
					<a class="dropdown-item" href="#">Погода</a>
					<div class="dropdown-item">
						<input type="checkbox" id="editMode" name="scales" checked>
						<label for="scales">Edit mode</label>
					</div>
				  </div>
				</li>
			</ul>
			<a class="btn btn-outline-primary" href="http://192.168.1.102/signIn">Sign In</a>
		</div>
	  </nav>


    <div id="bedroom" class="min-vh-100">
		<h1 class="text-center font-italic pt-5">Спальня</h1>
		<div class="album py-5">
			<div class="container">
				<div class="row">

					<div class="col-md-3 mb-4">
						<div class="card">
							<div class="card-body mt-n3">
								<div name="editButtons" class="text-right">
									<a href="">
										<i class="far fa-edit text-muted"></i>
									</a>
									<a href="">
										<i class="fas fa-times-circle text-danger"></i>
									</a>
								</div>
								<h5 class="card-title">Главный свет</h5>
								<button id="A0" type="button" class="btn btn-success">Включить</button>
							</div>
						</div>
					</div>

					<div class="col-md-3 mb-4">
						<div class="card">
							<div class="card-body mt-n3">
								<div class=" text-right">
									<i class="far fa-edit text-muted"></i>
									<i class="fas fa-times-circle text-danger"></i>
								</div>
								<h5 class="card-title ">Светильник</h5>
								<button id="A1" type="button" class="btn btn-success">Включить</button>
							</div>
						</div>
					</div>

					<div class="col-md-6 mb-4">
						<div class="card">
							<div class="card-body mt-n3">
								<div class=" text-right">
									<i class="far fa-edit text-muted"></i>
									<i class="fas fa-times-circle text-danger"></i>
								</div>
								<h5 class="card-title">Вентиляция</h5>
								<div id="debug"></div>
								<div class="slidecontainer">
									<!--TODO: Реализовать работу на телефоне. На событие click не реагирует-->
									<input id="B0" type="range" min="1" max="100" value="50" class="slider">
								</div>
							</div>
						</div>
					</div>

					<div class="col-md-3 mb-4">
						<div class="card">
							<div class="card-body mt-n3">
								<div class=" text-right">
									<i class="far fa-edit text-muted"></i>
									<i class="fas fa-times-circle text-danger"></i>
								</div>
								<h5 class="card-title">Шторы</h5>
								<!-- TODO: Шкала прогресса открытия штор. После открытия кнопка меняется на 'Закрыть'  -->
								<div class="btn-group">
									<button type="button" class="btn btn-outline-success">Open</button>
									<button type="button" class="btn btn-outline-warning">Stop</button>
									<button type="button" class="btn btn-outline-danger">Close</button>
								</div>
							</div>
						</div>
					</div>

					<div class="col-md-3 mb-4">
						<div class="card">
							<div class="card-body mt-n3">
								<div class=" text-right" >
									<i class="far fa-edit text-muted"></i>
									<i class="fas fa-times-circle text-danger"></i>
								</div>
								<h5 class="card-title ">RGB подсветка</h5>
							  	<input type="color" name="" id="ColorRGB" value="#fd3cf8">
							  	<div class="btn-group">
									<button type="button" class="btn btn-outline-success">On</button>
									<button type="button" class="btn btn-outline-danger">Off</button>
								</div>
						  	</div>
						</div>
					</div>
				</div>

				<div class="row">
					<div class="col-md-3 mb-4">
						<div class="card">
							<div class="card-body">
								<div class="mb-2">
									<i class="fas fa-plus-square d-inline"></i>
									<h5 class="card-title d-inline">Add new item</h5>
								</div>
								<label class="sr-only" for="inlineFormInputGroup">Username</label>
								<div class="input-group mb-2">
									<div class="input-group-prepend">
										<div class="input-group-text">Label</div>
									</div>
									<input type="text" class="form-control" id="inlineFormInputGroup" placeholder="Username">
								</div>
								
								<div class="input-group mb-3">
									<div class="input-group-prepend">
									  <label class="input-group-text" for="inputGroupSelect01">Type</label>
									</div>
									<select class="custom-select" id="inputGroupSelect01">
									  <option selected>Choose...</option>
									  <option value="1">One</option>
									  <option value="2">Two</option>
									  <option value="3">Three</option>
									</select>
								</div>
								<div class="input-group mb-3">
									<div class="input-group-prepend">
									  <label class="input-group-text" for="inputGroupSelect01">Type</label>
									</div>
									<select class="custom-select" id="inputGroupSelect01">
									  <option selected>Choose...</option>
									  <option value="1">One</option>
									  <option value="2">Two</option>
									  <option value="3">Three</option>
									</select>
								</div>
								<button name="addButton" type="button" class="btn btn-success w-100">Add</button>
							</div>
						</div>
					</div>
				</div>

			</div>
		</div>
    </div>
	  
	<div id="hall" class="min-vh-100 bg-light">
		<h1 class="text-center font-italic pt-5">Прихожая</h1>
		
    </div>
	  
	<div id="bathroom" class="min-vh-100"> 
		<h1 class="text-center font-italic pt-5">Санузел</h1>	  
	</div>
	  
	<div id="kitchen" class="min-vh-100 bg-light">
        <h1 class="text-center font-italic pt-5">Кухня</h1>
    </div>

	<!-- Footer -->
<footer class="page-footer font-small bg-dark">

	<!-- Copyright -->
	<div class="footer-copyright text-center py-3 text-white">SmartHouseNV</div>
	<!-- Copyright -->
  
  </footer>
  <!-- Footer -->

    <script src="https://code.jquery.com/jquery-3.4.1.slim.min.js" integrity="sha384-J6qa4849blE2+poT4WnyKhv5vZF5SrPo0iEjwBvKU7imGFAV0wwj1yYfoRSJoZ+n" crossorigin="anonymous"></script>
    <script src="https://cdn.jsdelivr.net/npm/popper.js@1.16.0/dist/umd/popper.min.js" integrity="sha384-Q6E9RHvbIyZFJoft+2mJbHaEWldlvI9IOYy5n3zV9zzTtmI3UksdQRVvoxMfooAo" crossorigin="anonymous"></script>
    <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/js/bootstrap.min.js" integrity="sha384-wfSDF2E50Y2D1uUdj0O3uMBJnjuUD4Ih7YwaYd1iqfktj0Uod8GCExl3Og8ifwB6" crossorigin="anonymous"></script>
	<script src="usualSite.js"></script>
</body>
</body>
</html>`;


require("Storage").write("a", data);