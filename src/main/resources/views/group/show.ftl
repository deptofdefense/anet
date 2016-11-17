<#import "../application/layout.ftl" as application>
<@application.layout>

<h2>Group: ${name}</h2>

Group Members:
<ul>
<#list members as m>
	<li>${m} <a data-pid="${m.id}" href="#" class="removePersonLink" >[Remove]</a></li>
<#else>
No group members :(
</#list>
</ul>

Add person to group: <select id="personSearch" style="width:400px;"></select>
<button id="personAddBtn">Add</button><br>

<script type="text/javascript">
$(document).ready(function() {
	$("#personSearch").select2( {
	    dropdownParent: $(".mainbody"),
		ajax: {
			url: "/people/search",
			delay: 250,
			method: 'GET',
			data: function(params) {
				return { q: params.term}
			},
			processResults : function(data, params) {
				var results = _.map(data, function(el) {
					return {
						id: el["id"],
						text: el["firstName"] + " " + el["lastName"] + " (" + el["role"] + ")"
					}
				});
				return { results: results };
			}
		},
		minimumInputLength: 2,
		placeholder: "Search for People"
	});

	$("#personAddBtn").on('click', function(event) {
		var personId = $("#personSearch").val();
		$.ajax({ url: '/groups/' + ${id} + '/addMember?personId=' + personId,
			method: "GET"
		}).done(function (response) {
			location.reload();
		})
	});

	$(".removePersonLink").on("click", function(event) {
		var personId = $(event.currentTarget).attr("data-pid");
		$.ajax( {
			url: "/groups/${id}/removeMember?personId=" + personId,
			method: "GET"
		}).done( function(response) {
			location.reload();
		});
	});
});
</script>

</@application.layout>
