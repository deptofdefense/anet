<#macro layout>
<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="utf-8">
		<meta http-equiv="X-UA-Compatible" content="IE=edge">
		<meta name="viewport" content="width=device-width, initial-scale=1">
		<title>ANET</title>

		<!-- Bootstrap -->
		<link href="/assets/css/bootstrap.css" rel="stylesheet">
		<#-- <link href="/assets/css/bootstrap-theme.css" rel="stylesheet"> -->
		<link href="/assets/css/bootstrap-datepicker.css" rel="stylesheet" />
		<link rel="stylesheet" href="/assets/css/uswds.css">
		<link href="/assets/css/select2.css" rel="stylesheet" />
		<link href="/assets/css/style.less" rel="stylesheet/less" type="text/css">

		<!-- HTML5 shim and Respond.js for IE8 support of HTML5 elements and media queries -->
		<!-- WARNING: Respond.js doesn't work if you view the page via file:// -->
		<!--[if lt IE 9]>
			<script src="https://oss.maxcdn.com/html5shiv/3.7.3/html5shiv.min.js"></script>
			<script src="https://oss.maxcdn.com/respond/1.4.2/respond.min.js"></script>
		<![endif]-->

		<!-- jQuery (necessary for Bootstrap's JavaScript plugins) -->
		<script src="/assets/js/jquery.js"></script>
		<script src="/assets/js/underscore-min.js"></script>
		<script src="/assets/js/uswds.js"></script>

		<!-- Include all compiled plugins (below), or include individual files as needed -->
		<script src="/assets/js/bootstrap.min.js"></script>
		<script src="/assets/js/bootstrap-datepicker.js"></script>
		<script src="/assets/js/less.min.js"></script>
		<script src="/assets/js/anet.js" ></script>
	</head>

	<body>
		<div class="container mainbody">
			<div class="security" style="background:${context.securityColor}">
				${context.securityMarking} || ${context.currentUser} || ${context.url}
			</div>

			<div class="row">
				<div class="col-md-3">
					<#include "navigation.ftl">
				</div>

				<div class="col-md-8">
					<form class="usa-search usa-search-small top-search" action="/search" >
						<div role="search">
							<label class="usa-sr-only" for="search-field-small">Search small</label>
							<input type="hidden" name="types" value="people,poams,locations,reports,organizations,positions" />
							<input id="search-field-small" type="search" name="q">
							<button type="submit"><span class="usa-sr-only">Search</span></button>
						</div>
					</form>

					<#nested/>

				</div>
			</div>
		</div>

		<#if context.devMode>
		<script type="text/javascript">
			less.env = "development";
		</script>
		</#if>
		<script src="/assets/js/select2.js"></script>
	</body>
</html>
</#macro>
