<#include "../template/header.ftl">
<h2>Viewing Position</h2>

<table>
<tr>
	<td>Name</td>
	<td>${name}</td>
</tr>
<tr>
	<td> Org</td>
	<td><#if organization??><a href="/organizations/${organization.id}">${organization.name}</a></#if></td>
</tr>
<tr>
	<td colspan=2>
		<#if person??>
			Currently filled by: ${person}
		<#else>
			No person currently in this position<br>
			<i style="font-size:12px" >(go to a person page to set the position on a person.. )</i>
		</#if>
	</td>
</tr>
<tr>
	<td>Other Positions assigned to this Position</td>
	<td>
		<#list associatedPositions>
			<ul>
			<#items as position>
				<li>${position.name} 
				(<a href="/positions/${position.id}">${postion.code}</a>) 
				- [<a data-id="${position.id}" class="positionRemoveBtn">delete</a>]
				</li>
			</#items>
			</ul>
		<#else>
			No Associated Positions :( <br>
		</#list>
		<label for="newPositionSelect">Assign Position to this position:</label>
		<select id="newPositionSelect" style="width:100%"></select><br>
		<button id="newPositionBtn" >Assign</button>
	</td>
</tr>
</table>

<a href="/positions/${id}/edit">[Edit this position]</a>
<#include "../template/footer.ftl">

<script type="text/javascript">
$(document).ready(function() { 
	$("#newPositionSelect").select2({
		dropdownParent: $(".mainbody"),
		placeholder: "search by code",
		ajax: {
			url: "/positions/byCode",
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

	$("#newPositionBtn").on('click', function() { 
		var positionId = $("#newPositionSelect").val();
		$.ajax({ url : "/positions/${id}/associated",
			contentType: 'application/json',
			method: 'POST',
			data : JSON.stringify( { "id" : positionId})
		}).done(function(response) { 
			location.reload();
		});
	});

});

</script>