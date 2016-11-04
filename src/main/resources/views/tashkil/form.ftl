<#include "../template/header.ftl">
<h1>
<#if id?? >
	Editing ${name}
<#else>
	Create a new Tashkil
</#if>
</h1>

<form id="tashkilForm">
Name: <input type="text" name="name" value="${name!}" /><br>
Code: <input type="text" name="code" value="${code!}" /><br>
<input type="hidden" name="id" value="${id!}" />
</form>
<input type="submit" value="Save" id="saveBtn" />
<#include "../template/footer.ftl">

<script type="text/javascript">
$(document).ready(function() {
	$("#saveBtn").on('click', function(event) { 
		var tashkil = buildForm("tashkilForm");
		var url = '/tashkils/' + <#if id??>'update'<#else>'new'</#if>
		$.ajax({ url : url,
			method: 'POST',
			contentType: 'application/json',
			data: JSON.stringify(tashkil)
		}).done(function (response) { 
			window.location = '/tashkils/' + <#if id??>${id}<#else>response.id</#if>;
		});
	});
});
</script>