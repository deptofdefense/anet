<#include "../template/header.ftl">
<h1>
<#if id?? >
	Editing ${name}
<#else>
	Create a new Billet
</#if>
</h1>

<form id="billetForm">
Name: <input type="text" name="name" value="${name!}" /><br>
Advisor Organization: <select name="ao" id="aoSelect" >
<#if advisorOrganization??>
	<option value="${advisorOrganization.id}" selected>${advisorOrganization.name}</select>
</#if>
</select>
<input type="hidden" name="id" value="${id!}" />
</form>
<input type="submit" value="Save" id="saveBtn" />
<#include "../template/footer.ftl">

<script type="text/javascript">
$(document).ready(function() {
	var aoData = [<#list context.aos as ao>
	 	{id : ${ao.id}, text: "${ao.name}"},
	 	</#list>];
	$("#aoSelect").select2({
		data: aoData
	});
	$("#saveBtn").on('click', function(event) { 
		var billet = buildForm("billetForm");
		if (billet["ao"]) { 
			billet["advisorOrganization"] = { id: billet["ao"] };
			delete billet["ao"]
		}
		var url = '/billets/' + <#if id??>'update'<#else>'new'</#if>
		$.ajax({ url : url,
			method: 'POST',
			contentType: 'application/json',
			data: JSON.stringify(billet)
		}).done(function (response) { 
			window.location = '/billets/' + <#if id??>${id}<#else>response.id</#if>;
		});
	});
});
</script>