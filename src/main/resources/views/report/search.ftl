<#import "../application/layout.ftl" as application>
<@application.layout>

<#list list as report>
<section class="anet-block">
  <div class="anet-block__title">
    ${report.createdAt} - ${report.author.name} with Principal Name
    <div class="pull-right">
    	Approval Status
    </div>
  </div>

  <div class="anet-block__body">
    <div class="row">
      <div class="col-md-6">
       <div class="field">
       	<div class="header">Status:</div>
       	<div class="content">${report.state}</div>
	   </div>
	  </div>
      <div class="col-md-6">
        <div class="field">
        ${report.reportText}
        </div>
        <div class="field">
        <small>
        Created at: ${report.createdAt} <br>Updated at: ${report.updatedAt}
        </small>
        </div>
      </div>
 	</div>
 	<div class="row">
 	<a class="pull-right" href="/reports/${report.id}/">View</a>
 	</div>
</section>
</#list>

<script type="text/javascript">
$(document).ready(function() {
	$('.expand').on('click',function(e){
	var target = $(e.currentTarget).parents('.anet-block').find('.expanded-area')
	if(target.hasClass('show')) {
		target.removeClass('show')
	} else {
		target.addClass('show')
	}
	})

	$(".reportSubmitBtn").on("click", function(event) {
		var id = $(event.currentTarget).attr("data-id");
		$.ajax({
			url: "/reports/" + id + "/submit",
			method: "GET"
		}).done(function(response) {
			location.reload();
		});
	});

	$(".reportApproveBtn").on("click", function(event) {
		var id = $(event.currentTarget).attr("data-id");
		$.ajax({
			url: "/reports/" + id + "/approve",
			method: "GET"
		}).done(function(response) {
			location.reload();
		});
	});
	$(".reportRejectBtn").on("click", function(event) {
		var id = $(event.currentTarget).attr("data-id");
		$.ajax({
			url: "/reports/" + id + "/reject",
			method: "GET"
		}).done(function(response) {
			location.reload();
		});
	});
})
</script>

</@application.layout>
