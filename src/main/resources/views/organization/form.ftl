<#include "../template/header.ftl">
<h1>
<#if id?? >
	Editing ${name}
<#else>
	Create a new Organization
</#if>
</h1>

<form id="orgForm" >
Name: <input type="text" name="name" value="${name!}" /><br>
Type: <select name="type">
	<option value="PRINCIPAL_ORG" <#if type == 'PRINCIPAL_ORG'>selected</#if>>Afghan Govt Org</option>
	<option value="ADVISOR_ORG" <#if type == 'ADVISOR_ORG'>selected</#if>>Advisor Organization</option>
</select><br>
<#if id??>
<input type="hidden" name="id" value="${id}" />
</#if>
</form>
<input type="submit" value="Save" id="orgSaveBtn" />

<script type="text/javascript">
$(document).ready(function() {
	<#if id??>
		var url = '/organizations/update'
	<#else>
		var url = '/organizations/new'
	</#if>

	$("#orgSaveBtn").on('click', function (event) { 
		$.ajax({ 
			url: url, 
			method: 'POST',
			contentType: 'application/json',
			data: jsonForm("orgForm")
		}).done(function (response) {
			<#if id??>
				window.location = "/organizations/${id}"
			<#else>
				window.location = "/organizations/" + response.id;
			</#if>
		});
	});
});
</script>

<#include "../template/footer.ftl">
