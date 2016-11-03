<div class="logo">
    <a href="/"><img alt="ANET" src="/assets/img/anet.png"></a>
</div>
<div class="navigation">
  <ul class="usa-sidenav-list">
    <li><a <#if context.url == "">class="usa-current" </#if> href="/">Home</a></li>
    <li><a <#if context.url == "reports/new">class="usa-current" </#if> href="/reports/new">Submit a Report</a>
      <ul class="usa-sidenav-sub_list">
        <li><a href="#">Your Details</a></li>
      </ul>
    </li>
    <li><a href="/">Your Reports &amp; Approvals</a></li>
    <li><a href="/">Analytics</a></li>
    <li><a href="#">Advisor Organizations</a>
      <ul class="collapsed usa-sidenav-sub_list">
        <#assign seq = ["foo", "bar", "baz"]>
        <#list seq as ao>
          <li>
            <a href="/ao/${ao}">${ao}</a>
          </li>
        <#else>
          <li>No AOs in Db</li>
        </#list>
      </ul>
    </li>
    <li><a href="/">ANET Training</a></li>
    <li><a href="/assets/anet-roadmap.jpg">ANETRoadmap</a></li>
  </ul>
</div>