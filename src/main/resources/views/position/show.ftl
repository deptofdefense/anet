<#include "../template/header.ftl">
<h2>Viewing Billet</h2>

<table>
<tr>
	<td>Name</td>
	<td>${name}</td>
</tr>
<tr>
	<td>Advisor Org</td>
	<td><#if advisorOrganization??><a href="/advisorOrganizations/${advisorOrganization.id}">${advisorOrganization.name}</a></#if></td>
</tr>
<tr>
	<td colspan=2>
		<#if advisor??>
			Currently filled by: ${advisor}
		<#else>
			No person currently in this billet<br>
			<i style="font-size:12px" >(go to a person page to set the billet on a person.. )</i>
		</#if>
	</td>
</tr>
<tr>
	<td>Tashkils assigned to this Billet</td>
	<td>
		<#list tashkils>
			<ul>
			<#items as tashkil>
				<li>${tashkil.name} 
				(<a href="/tashkils/${tashkil.id}">${tashkil.code}</a>) 
				- [<a data-id="${tashkil.id}" class="tashkilRemoveBtn">delete</a>]
				</li>
			</#items>
			</ul>
		<#else>
			No Tashkils :( <br>
		</#list>
		<label for="newTashkilSelect">Assign Tashkil to this billet:</label>
		<select id="newTashkilSelect" style="width:100%"></select><br>
		<button id="newTashkilBtn" >Assign</button>
	</td>
</tr>
</table>

<a href="/billets/${id}/edit">[Edit this billet]</a>
<#include "../template/footer.ftl">

<script type="text/javascript">
$(document).ready(function() { 
	$("#newTashkilSelect").select2({
		dropdownParent: $(".mainbody"),
		placeholder: "search by code",
		ajax: {
			url: "/tashkils/byCode",
			dataType: 'json',
			delay: 250,
			method: 'GET',
			data: function(params) {
				return { code : params.term, prefixMatch: true}
			},
			processResults :  function(data, params) {
				var results =_.map(data, function (el) {
					return {
						id: el["id"] ,
						text: el["name"] + " (" + el["code"] + ")"
					}
				});
				return { results: results };
			}
		},
		minimumInputLength : 2
	});

	$("#newTashkilBtn").on('click', function() { 
		var tashkilId = $("#newTashkilSelect").val();
		$.ajax({ url : "/billets/${id}/tashkils",
			contentType: 'application/json',
			method: 'POST',
			data : JSON.stringify( { "id" : tashkilId})
		}).done(function(response) { 
			location.reload();
		});
	});

});

</script>