<#include "../template/header.ftl">
<h1>
<#if id?? >
	Editing ${name}
<#else>
	Create a new Group
</#if>
</h1>

<form id="groupForm" >
Name: <input type="text" name="name" value="${name!}" /><br>
<#if id??>
<input type="hidden" name="id" value="${id}" />
</#if>
</form>
<input type="submit" value="Save" id="saveBtn" />

<script type="text/javascript">
$(document).ready(function() {
	<#if id??>
		var url = '/groups/rename'
	<#else>
		var url = '/groups/new'
	</#if>

	$("#saveBtn").on('click', function (event) { 
		$.ajax({ 
			url: url, 
			method: 'POST',
			contentType: 'application/json',
			data: jsonForm("groupForm")
		}).done(function (response) {
			<#if id??>
				window.location = "/groups/${id}"
			<#else>
				window.location = "/groups/" + response.id;
			</#if>
		});
	});
});
</script>

<#include "../template/footer.ftl">
