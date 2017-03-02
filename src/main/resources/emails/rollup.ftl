<!DOCTYPE html>
<html style="font-family:sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;font-size:10px;-webkit-tap-highlight-color:rgba(0, 0, 0, 0);">
  <head>
    <title>${subject}</title>
    <style>
      a:active{outline:0}
      a:hover{outline:0}
      button::-moz-focus-inner{padding:0;border:0}
      input::-moz-focus-inner{padding:0;border:0}
      input[type=number]::-webkit-inner-spin-button{height:auto}
      input[type=number]::-webkit-outer-spin-button{height:auto}
      input[type=search]::-webkit-search-cancel-button{-webkit-appearance:none}
      input[type=search]::-webkit-search-decoration{-webkit-appearance:none}
      :after{box-sizing:border-box}
      :before{box-sizing:border-box}
      a:focus{color:#23527c;text-decoration:underline}
      a:hover{color:#23527c;text-decoration:underline}
      a:focus{outline:5px auto -webkit-focus-ring-color;outline-offset:-2px}
      .sr-only-focusable:active{position:static;width:auto;height:auto;margin:0;overflow:visible;clip:auto}
      .sr-only-focusable:focus{position:static;width:auto;height:auto;margin:0;overflow:visible;clip:auto}
      a.text-primary:focus{color:#286090}
      a.text-primary:hover{color:#286090}
      a.text-success:focus{color:#2b542c}
      a.text-success:hover{color:#2b542c}
      a.text-info:focus{color:#245269}
      a.text-info:hover{color:#245269}
      a.text-warning:focus{color:#66512c}
      a.text-warning:hover{color:#66512c}
      a.text-danger:focus{color:#843534}
      a.text-danger:hover{color:#843534}
      a.bg-primary:focus{background-color:#286090}
      a.bg-primary:hover{background-color:#286090}
      a.bg-success:focus{background-color:#c1e2b3}
      a.bg-success:hover{background-color:#c1e2b3}
      a.bg-info:focus{background-color:#afd9ee}
      a.bg-info:hover{background-color:#afd9ee}
      a.bg-warning:focus{background-color:#f7ecb5}
      a.bg-warning:hover{background-color:#f7ecb5}
      a.bg-danger:focus{background-color:#e4b9b9}
      a.bg-danger:hover{background-color:#e4b9b9}
      blockquote .small:before{content:"\2014   \A0"}
      blockquote footer:before{content:"\2014   \A0"}
      blockquote small:before{content:"\2014   \A0"}
      .blockquote-reverse .small:before{content:""}
      .blockquote-reverse footer:before{content:""}
      .blockquote-reverse small:before{content:""}
      blockquote.pull-right .small:before{content:""}
      blockquote.pull-right footer:before{content:""}
      blockquote.pull-right small:before{content:""}
      .blockquote-reverse .small:after{content:"\A0   \2014"}
      .blockquote-reverse footer:after{content:"\A0   \2014"}
      .blockquote-reverse small:after{content:"\A0   \2014"}
      blockquote.pull-right .small:after{content:"\A0   \2014"}
      blockquote.pull-right footer:after{content:"\A0   \2014"}
      blockquote.pull-right small:after{content:"\A0   \2014"}
      .table-hover > tbody > tr:hover{background-color:#f5f5f5}
      table col[class * =col-]{position:static;display:table-column;float:none}
      table td[class * =col-]{position:static;display:table-cell;float:none}
      table th[class * =col-]{position:static;display:table-cell;float:none}
      .table-hover > tbody > tr.active:hover > td{background-color:#e8e8e8}
      .table-hover > tbody > tr.active:hover > th{background-color:#e8e8e8}
      .table-hover > tbody > tr:hover > .active{background-color:#e8e8e8}
      .table-hover > tbody > tr > td.active:hover{background-color:#e8e8e8}
      .table-hover > tbody > tr > th.active:hover{background-color:#e8e8e8}
      .table-hover > tbody > tr.success:hover > td{background-color:#d0e9c6}
      .table-hover > tbody > tr.success:hover > th{background-color:#d0e9c6}
      .table-hover > tbody > tr:hover > .success{background-color:#d0e9c6}
      .table-hover > tbody > tr > td.success:hover{background-color:#d0e9c6}
      .table-hover > tbody > tr > th.success:hover{background-color:#d0e9c6}
      .table-hover > tbody > tr.info:hover > td{background-color:#c4e3f3}
      .table-hover > tbody > tr.info:hover > th{background-color:#c4e3f3}
      .table-hover > tbody > tr:hover > .info{background-color:#c4e3f3}
      .table-hover > tbody > tr > td.info:hover{background-color:#c4e3f3}
      .table-hover > tbody > tr > th.info:hover{background-color:#c4e3f3}
      .table-hover > tbody > tr.warning:hover > td{background-color:#faf2cc}
      .table-hover > tbody > tr.warning:hover > th{background-color:#faf2cc}
      .table-hover > tbody > tr:hover > .warning{background-color:#faf2cc}
      .table-hover > tbody > tr > td.warning:hover{background-color:#faf2cc}
      .table-hover > tbody > tr > th.warning:hover{background-color:#faf2cc}
      .table-hover > tbody > tr.danger:hover > td{background-color:#ebcccc}
      .table-hover > tbody > tr.danger:hover > th{background-color:#ebcccc}
      .table-hover > tbody > tr:hover > .danger{background-color:#ebcccc}
      .table-hover > tbody > tr > td.danger:hover{background-color:#ebcccc}
      .table-hover > tbody > tr > th.danger:hover{background-color:#ebcccc}
      input[type=checkbox]:focus{outline:5px auto -webkit-focus-ring-color;outline-offset:-2px}
      input[type=file]:focus{outline:5px auto -webkit-focus-ring-color;outline-offset:-2px}
      input[type=radio]:focus{outline:5px auto -webkit-focus-ring-color;outline-offset:-2px}
      .form-control:focus{border-color:#66afe9;outline:0;box-shadow:inset 0 1px 1px rgba(0, 0, 0, .075), 0 0 8px rgba(102, 175, 233, .6)}
      .form-control::-moz-placeholder{color:#999;opacity:1}
      .form-control:-ms-input-placeholder{color:#999}
      .form-control::-webkit-input-placeholder{color:#999}
      .form-control::-ms-expand{background-color:transparent;border:0}
      .has-success .form-control:focus{border-color:#2b542c;box-shadow:inset 0 1px 1px rgba(0, 0, 0, .075), 0 0 6px #67b168}
      .has-warning .form-control:focus{border-color:#66512c;box-shadow:inset 0 1px 1px rgba(0, 0, 0, .075), 0 0 6px #c0a16b}
      .has-error .form-control:focus{border-color:#843534;box-shadow:inset 0 1px 1px rgba(0, 0, 0, .075), 0 0 6px #ce8483}
      .btn.active:focus{outline:5px auto -webkit-focus-ring-color;outline-offset:-2px}
      .btn:active.focus{outline:5px auto -webkit-focus-ring-color;outline-offset:-2px}
      .btn:active:focus{outline:5px auto -webkit-focus-ring-color;outline-offset:-2px}
      .btn:focus{outline:5px auto -webkit-focus-ring-color;outline-offset:-2px}
      .btn:focus{color:#333;text-decoration:none}
      .btn:hover{color:#333;text-decoration:none}
      .btn:active{background-image:none;outline:0;box-shadow:inset 0 3px 5px rgba(0, 0, 0, .125)}
      .btn-default:focus{color:#333;background-color:#e6e6e6;border-color:#8c8c8c}
      .btn-default:active{color:#333;background-color:#e6e6e6;border-color:#adadad}
      .btn-default:hover{color:#333;background-color:#e6e6e6;border-color:#adadad}
      .btn-default.active:focus{color:#333;background-color:#d4d4d4;border-color:#8c8c8c}
      .btn-default.active:hover{color:#333;background-color:#d4d4d4;border-color:#8c8c8c}
      .btn-default:active.focus{color:#333;background-color:#d4d4d4;border-color:#8c8c8c}
      .btn-default:active:focus{color:#333;background-color:#d4d4d4;border-color:#8c8c8c}
      .btn-default:active:hover{color:#333;background-color:#d4d4d4;border-color:#8c8c8c}
      .open > .dropdown-toggle.btn-default:focus{color:#333;background-color:#d4d4d4;border-color:#8c8c8c}
      .open > .dropdown-toggle.btn-default:hover{color:#333;background-color:#d4d4d4;border-color:#8c8c8c}
      .btn-default:active{background-image:none}
      .btn-default.disabled:focus{background-color:#fff;border-color:#ccc}
      .btn-default.disabled:hover{background-color:#fff;border-color:#ccc}
      .btn-default[disabled]:focus{background-color:#fff;border-color:#ccc}
      .btn-default[disabled]:hover{background-color:#fff;border-color:#ccc}
      fieldset[disabled] .btn-default:focus{background-color:#fff;border-color:#ccc}
      fieldset[disabled] .btn-default:hover{background-color:#fff;border-color:#ccc}
      .btn-primary:focus{color:#fff;background-color:#286090;border-color:#122b40}
      .btn-primary:active{color:#fff;background-color:#286090;border-color:#204d74}
      .btn-primary:hover{color:#fff;background-color:#286090;border-color:#204d74}
      .btn-primary.active:focus{color:#fff;background-color:#204d74;border-color:#122b40}
      .btn-primary.active:hover{color:#fff;background-color:#204d74;border-color:#122b40}
      .btn-primary:active.focus{color:#fff;background-color:#204d74;border-color:#122b40}
      .btn-primary:active:focus{color:#fff;background-color:#204d74;border-color:#122b40}
      .btn-primary:active:hover{color:#fff;background-color:#204d74;border-color:#122b40}
      .open > .dropdown-toggle.btn-primary:focus{color:#fff;background-color:#204d74;border-color:#122b40}
      .open > .dropdown-toggle.btn-primary:hover{color:#fff;background-color:#204d74;border-color:#122b40}
      .btn-primary:active{background-image:none}
      .btn-primary.disabled:focus{background-color:#337ab7;border-color:#2e6da4}
      .btn-primary.disabled:hover{background-color:#337ab7;border-color:#2e6da4}
      .btn-primary[disabled]:focus{background-color:#337ab7;border-color:#2e6da4}
      .btn-primary[disabled]:hover{background-color:#337ab7;border-color:#2e6da4}
      fieldset[disabled] .btn-primary:focus{background-color:#337ab7;border-color:#2e6da4}
      fieldset[disabled] .btn-primary:hover{background-color:#337ab7;border-color:#2e6da4}
      .btn-success:focus{color:#fff;background-color:#449d44;border-color:#255625}
      .btn-success:active{color:#fff;background-color:#449d44;border-color:#398439}
      .btn-success:hover{color:#fff;background-color:#449d44;border-color:#398439}
      .btn-success.active:focus{color:#fff;background-color:#398439;border-color:#255625}
      .btn-success.active:hover{color:#fff;background-color:#398439;border-color:#255625}
      .btn-success:active.focus{color:#fff;background-color:#398439;border-color:#255625}
      .btn-success:active:focus{color:#fff;background-color:#398439;border-color:#255625}
      .btn-success:active:hover{color:#fff;background-color:#398439;border-color:#255625}
      .open > .dropdown-toggle.btn-success:focus{color:#fff;background-color:#398439;border-color:#255625}
      .open > .dropdown-toggle.btn-success:hover{color:#fff;background-color:#398439;border-color:#255625}
      .btn-success:active{background-image:none}
      .btn-success.disabled:focus{background-color:#5cb85c;border-color:#4cae4c}
      .btn-success.disabled:hover{background-color:#5cb85c;border-color:#4cae4c}
      .btn-success[disabled]:focus{background-color:#5cb85c;border-color:#4cae4c}
      .btn-success[disabled]:hover{background-color:#5cb85c;border-color:#4cae4c}
      fieldset[disabled] .btn-success:focus{background-color:#5cb85c;border-color:#4cae4c}
      fieldset[disabled] .btn-success:hover{background-color:#5cb85c;border-color:#4cae4c}
      .btn-info:focus{color:#fff;background-color:#31b0d5;border-color:#1b6d85}
      .btn-info:active{color:#fff;background-color:#31b0d5;border-color:#269abc}
      .btn-info:hover{color:#fff;background-color:#31b0d5;border-color:#269abc}
      .btn-info.active:focus{color:#fff;background-color:#269abc;border-color:#1b6d85}
      .btn-info.active:hover{color:#fff;background-color:#269abc;border-color:#1b6d85}
      .btn-info:active.focus{color:#fff;background-color:#269abc;border-color:#1b6d85}
      .btn-info:active:focus{color:#fff;background-color:#269abc;border-color:#1b6d85}
      .btn-info:active:hover{color:#fff;background-color:#269abc;border-color:#1b6d85}
      .open > .dropdown-toggle.btn-info:focus{color:#fff;background-color:#269abc;border-color:#1b6d85}
      .open > .dropdown-toggle.btn-info:hover{color:#fff;background-color:#269abc;border-color:#1b6d85}
      .btn-info:active{background-image:none}
      .btn-info.disabled:focus{background-color:#5bc0de;border-color:#46b8da}
      .btn-info.disabled:hover{background-color:#5bc0de;border-color:#46b8da}
      .btn-info[disabled]:focus{background-color:#5bc0de;border-color:#46b8da}
      .btn-info[disabled]:hover{background-color:#5bc0de;border-color:#46b8da}
      fieldset[disabled] .btn-info:focus{background-color:#5bc0de;border-color:#46b8da}
      fieldset[disabled] .btn-info:hover{background-color:#5bc0de;border-color:#46b8da}
      .btn-warning:focus{color:#fff;background-color:#ec971f;border-color:#985f0d}
      .btn-warning:active{color:#fff;background-color:#ec971f;border-color:#d58512}
      .btn-warning:hover{color:#fff;background-color:#ec971f;border-color:#d58512}
      .btn-warning.active:focus{color:#fff;background-color:#d58512;border-color:#985f0d}
      .btn-warning.active:hover{color:#fff;background-color:#d58512;border-color:#985f0d}
      .btn-warning:active.focus{color:#fff;background-color:#d58512;border-color:#985f0d}
      .btn-warning:active:focus{color:#fff;background-color:#d58512;border-color:#985f0d}
      .btn-warning:active:hover{color:#fff;background-color:#d58512;border-color:#985f0d}
      .open > .dropdown-toggle.btn-warning:focus{color:#fff;background-color:#d58512;border-color:#985f0d}
      .open > .dropdown-toggle.btn-warning:hover{color:#fff;background-color:#d58512;border-color:#985f0d}
      .btn-warning:active{background-image:none}
      .btn-warning.disabled:focus{background-color:#f0ad4e;border-color:#eea236}
      .btn-warning.disabled:hover{background-color:#f0ad4e;border-color:#eea236}
      .btn-warning[disabled]:focus{background-color:#f0ad4e;border-color:#eea236}
      .btn-warning[disabled]:hover{background-color:#f0ad4e;border-color:#eea236}
      fieldset[disabled] .btn-warning:focus{background-color:#f0ad4e;border-color:#eea236}
      fieldset[disabled] .btn-warning:hover{background-color:#f0ad4e;border-color:#eea236}
      .btn-danger:focus{color:#fff;background-color:#c9302c;border-color:#761c19}
      .btn-danger:active{color:#fff;background-color:#c9302c;border-color:#ac2925}
      .btn-danger:hover{color:#fff;background-color:#c9302c;border-color:#ac2925}
      .btn-danger.active:focus{color:#fff;background-color:#ac2925;border-color:#761c19}
      .btn-danger.active:hover{color:#fff;background-color:#ac2925;border-color:#761c19}
      .btn-danger:active.focus{color:#fff;background-color:#ac2925;border-color:#761c19}
      .btn-danger:active:focus{color:#fff;background-color:#ac2925;border-color:#761c19}
      .btn-danger:active:hover{color:#fff;background-color:#ac2925;border-color:#761c19}
      .open > .dropdown-toggle.btn-danger:focus{color:#fff;background-color:#ac2925;border-color:#761c19}
      .open > .dropdown-toggle.btn-danger:hover{color:#fff;background-color:#ac2925;border-color:#761c19}
      .btn-danger:active{background-image:none}
      .btn-danger.disabled:focus{background-color:#d9534f;border-color:#d43f3a}
      .btn-danger.disabled:hover{background-color:#d9534f;border-color:#d43f3a}
      .btn-danger[disabled]:focus{background-color:#d9534f;border-color:#d43f3a}
      .btn-danger[disabled]:hover{background-color:#d9534f;border-color:#d43f3a}
      fieldset[disabled] .btn-danger:focus{background-color:#d9534f;border-color:#d43f3a}
      fieldset[disabled] .btn-danger:hover{background-color:#d9534f;border-color:#d43f3a}
      .btn-link:active{background-color:transparent;box-shadow:none}
      .btn-link:active{border-color:transparent}
      .btn-link:focus{border-color:transparent}
      .btn-link:hover{border-color:transparent}
      .btn-link:focus{color:#23527c;text-decoration:underline;background-color:transparent}
      .btn-link:hover{color:#23527c;text-decoration:underline;background-color:transparent}
      .btn-link[disabled]:focus{color:#777;text-decoration:none}
      .btn-link[disabled]:hover{color:#777;text-decoration:none}
      fieldset[disabled] .btn-link:focus{color:#777;text-decoration:none}
      fieldset[disabled] .btn-link:hover{color:#777;text-decoration:none}
      .dropdown-toggle:focus{outline:0}
      .dropdown-menu > li > a:focus{color:#262626;text-decoration:none;background-color:#f5f5f5}
      .dropdown-menu > li > a:hover{color:#262626;text-decoration:none;background-color:#f5f5f5}
      .dropdown-menu > .active > a:focus{color:#fff;text-decoration:none;background-color:#337ab7;outline:0}
      .dropdown-menu > .active > a:hover{color:#fff;text-decoration:none;background-color:#337ab7;outline:0}
      .dropdown-menu > .disabled > a:focus{color:#777}
      .dropdown-menu > .disabled > a:hover{color:#777}
      .dropdown-menu > .disabled > a:focus{text-decoration:none;cursor:not-allowed;background-color:transparent;background-image:none;filter:progid: DXImageTransform.Microsoft.gradient(enabled = false)}
      .dropdown-menu > .disabled > a:hover{text-decoration:none;cursor:not-allowed;background-color:transparent;background-image:none;filter:progid: DXImageTransform.Microsoft.gradient(enabled = false)}
      .btn-group-vertical > .btn:active{z-index:2}
      .btn-group-vertical > .btn:focus{z-index:2}
      .btn-group-vertical > .btn:hover{z-index:2}
      .btn-group > .btn:active{z-index:2}
      .btn-group > .btn:focus{z-index:2}
      .btn-group > .btn:hover{z-index:2}
      .btn-group .dropdown-toggle:active{outline:0}
      .input-group[class * =col-]{float:none;padding-right:0;padding-left:0}
      .input-group .form-control:focus{z-index:3}
      .input-group-btn > .btn:active{z-index:2}
      .input-group-btn > .btn:focus{z-index:2}
      .input-group-btn > .btn:hover{z-index:2}
      .nav > li > a:focus{text-decoration:none;background-color:#eee}
      .nav > li > a:hover{text-decoration:none;background-color:#eee}
      .nav > li.disabled > a:focus{color:#777;text-decoration:none;cursor:not-allowed;background-color:transparent}
      .nav > li.disabled > a:hover{color:#777;text-decoration:none;cursor:not-allowed;background-color:transparent}
      .nav .open > a:focus{background-color:#eee;border-color:#337ab7}
      .nav .open > a:hover{background-color:#eee;border-color:#337ab7}
      .nav-tabs > li > a:hover{border-color:#eee #eee #ddd}
      .nav-tabs > li.active > a:focus{color:#555;cursor:default;background-color:#fff;border:1px solid #ddd;border-bottom-color:transparent}
      .nav-tabs > li.active > a:hover{color:#555;cursor:default;background-color:#fff;border:1px solid #ddd;border-bottom-color:transparent}
      .nav-tabs.nav-justified > .active > a:focus{border:1px solid #ddd}
      .nav-tabs.nav-justified > .active > a:hover{border:1px solid #ddd}
      .nav-pills > li.active > a:focus{color:#fff;background-color:#337ab7}
      .nav-pills > li.active > a:hover{color:#fff;background-color:#337ab7}
      .nav-tabs-justified > .active > a:focus{border:1px solid #ddd}
      .nav-tabs-justified > .active > a:hover{border:1px solid #ddd}
      .navbar-brand:focus{text-decoration:none}
      .navbar-brand:hover{text-decoration:none}
      .navbar-toggle:focus{outline:0}
      .navbar-default .navbar-brand:focus{color:#5e5e5e;background-color:transparent}
      .navbar-default .navbar-brand:hover{color:#5e5e5e;background-color:transparent}
      .navbar-default .navbar-nav > li > a:focus{color:#333;background-color:transparent}
      .navbar-default .navbar-nav > li > a:hover{color:#333;background-color:transparent}
      .navbar-default .navbar-nav > .active > a:focus{color:#555;background-color:#e7e7e7}
      .navbar-default .navbar-nav > .active > a:hover{color:#555;background-color:#e7e7e7}
      .navbar-default .navbar-nav > .disabled > a:focus{color:#ccc;background-color:transparent}
      .navbar-default .navbar-nav > .disabled > a:hover{color:#ccc;background-color:transparent}
      .navbar-default .navbar-toggle:focus{background-color:#ddd}
      .navbar-default .navbar-toggle:hover{background-color:#ddd}
      .navbar-default .navbar-nav > .open > a:focus{color:#555;background-color:#e7e7e7}
      .navbar-default .navbar-nav > .open > a:hover{color:#555;background-color:#e7e7e7}
      .navbar-default .navbar-link:hover{color:#333}
      .navbar-default .btn-link:focus{color:#333}
      .navbar-default .btn-link:hover{color:#333}
      .navbar-default .btn-link[disabled]:focus{color:#ccc}
      .navbar-default .btn-link[disabled]:hover{color:#ccc}
      fieldset[disabled] .navbar-default .btn-link:focus{color:#ccc}
      fieldset[disabled] .navbar-default .btn-link:hover{color:#ccc}
      .navbar-inverse .navbar-brand:focus{color:#fff;background-color:transparent}
      .navbar-inverse .navbar-brand:hover{color:#fff;background-color:transparent}
      .navbar-inverse .navbar-nav > li > a:focus{color:#fff;background-color:transparent}
      .navbar-inverse .navbar-nav > li > a:hover{color:#fff;background-color:transparent}
      .navbar-inverse .navbar-nav > .active > a:focus{color:#fff;background-color:#080808}
      .navbar-inverse .navbar-nav > .active > a:hover{color:#fff;background-color:#080808}
      .navbar-inverse .navbar-nav > .disabled > a:focus{color:#444;background-color:transparent}
      .navbar-inverse .navbar-nav > .disabled > a:hover{color:#444;background-color:transparent}
      .navbar-inverse .navbar-toggle:focus{background-color:#333}
      .navbar-inverse .navbar-toggle:hover{background-color:#333}
      .navbar-inverse .navbar-nav > .open > a:focus{color:#fff;background-color:#080808}
      .navbar-inverse .navbar-nav > .open > a:hover{color:#fff;background-color:#080808}
      .navbar-inverse .navbar-link:hover{color:#fff}
      .navbar-inverse .btn-link:focus{color:#fff}
      .navbar-inverse .btn-link:hover{color:#fff}
      .navbar-inverse .btn-link[disabled]:focus{color:#444}
      .navbar-inverse .btn-link[disabled]:hover{color:#444}
      fieldset[disabled] .navbar-inverse .btn-link:focus{color:#444}
      fieldset[disabled] .navbar-inverse .btn-link:hover{color:#444}
      .breadcrumb > li + li:before{padding:0 5px;color:#ccc;content:"/\A0"}
      .pagination > li > a:focus{z-index:2;color:#23527c;background-color:#eee;border-color:#ddd}
      .pagination > li > a:hover{z-index:2;color:#23527c;background-color:#eee;border-color:#ddd}
      .pagination > li > span:focus{z-index:2;color:#23527c;background-color:#eee;border-color:#ddd}
      .pagination > li > span:hover{z-index:2;color:#23527c;background-color:#eee;border-color:#ddd}
      .pagination > .active > a:focus{z-index:3;color:#fff;cursor:default;background-color:#337ab7;border-color:#337ab7}
      .pagination > .active > a:hover{z-index:3;color:#fff;cursor:default;background-color:#337ab7;border-color:#337ab7}
      .pagination > .active > span:focus{z-index:3;color:#fff;cursor:default;background-color:#337ab7;border-color:#337ab7}
      .pagination > .active > span:hover{z-index:3;color:#fff;cursor:default;background-color:#337ab7;border-color:#337ab7}
      .pagination > .disabled > a:focus{color:#777;cursor:not-allowed;background-color:#fff;border-color:#ddd}
      .pagination > .disabled > a:hover{color:#777;cursor:not-allowed;background-color:#fff;border-color:#ddd}
      .pagination > .disabled > span:focus{color:#777;cursor:not-allowed;background-color:#fff;border-color:#ddd}
      .pagination > .disabled > span:hover{color:#777;cursor:not-allowed;background-color:#fff;border-color:#ddd}
      .pager li > a:focus{text-decoration:none;background-color:#eee}
      .pager li > a:hover{text-decoration:none;background-color:#eee}
      .pager .disabled > a:focus{color:#777;cursor:not-allowed;background-color:#fff}
      .pager .disabled > a:hover{color:#777;cursor:not-allowed;background-color:#fff}
      a.label:focus{color:#fff;text-decoration:none;cursor:pointer}
      a.label:hover{color:#fff;text-decoration:none;cursor:pointer}
      .label-default[href]:focus{background-color:#5e5e5e}
      .label-default[href]:hover{background-color:#5e5e5e}
      .label-primary[href]:focus{background-color:#286090}
      .label-primary[href]:hover{background-color:#286090}
      .label-success[href]:focus{background-color:#449d44}
      .label-success[href]:hover{background-color:#449d44}
      .label-info[href]:focus{background-color:#31b0d5}
      .label-info[href]:hover{background-color:#31b0d5}
      .label-warning[href]:focus{background-color:#ec971f}
      .label-warning[href]:hover{background-color:#ec971f}
      .label-danger[href]:focus{background-color:#c9302c}
      .label-danger[href]:hover{background-color:#c9302c}
      a.badge:focus{color:#fff;text-decoration:none;cursor:pointer}
      a.badge:hover{color:#fff;text-decoration:none;cursor:pointer}
      a.thumbnail:focus{border-color:#337ab7}
      a.thumbnail:hover{border-color:#337ab7}
      a.list-group-item:focus{color:#555;text-decoration:none;background-color:#f5f5f5}
      a.list-group-item:hover{color:#555;text-decoration:none;background-color:#f5f5f5}
      button.list-group-item:focus{color:#555;text-decoration:none;background-color:#f5f5f5}
      button.list-group-item:hover{color:#555;text-decoration:none;background-color:#f5f5f5}
      .list-group-item.disabled:focus{color:#777;cursor:not-allowed;background-color:#eee}
      .list-group-item.disabled:hover{color:#777;cursor:not-allowed;background-color:#eee}
      .list-group-item.disabled:focus .list-group-item-heading{color:inherit}
      .list-group-item.disabled:hover .list-group-item-heading{color:inherit}
      .list-group-item.disabled:focus .list-group-item-text{color:#777}
      .list-group-item.disabled:hover .list-group-item-text{color:#777}
      .list-group-item.active:focus{z-index:2;color:#fff;background-color:#337ab7;border-color:#337ab7}
      .list-group-item.active:hover{z-index:2;color:#fff;background-color:#337ab7;border-color:#337ab7}
      .list-group-item.active:focus .list-group-item-heading{color:inherit}
      .list-group-item.active:focus .list-group-item-heading > .small{color:inherit}
      .list-group-item.active:focus .list-group-item-heading > small{color:inherit}
      .list-group-item.active:hover .list-group-item-heading{color:inherit}
      .list-group-item.active:hover .list-group-item-heading > .small{color:inherit}
      .list-group-item.active:hover .list-group-item-heading > small{color:inherit}
      .list-group-item.active:focus .list-group-item-text{color:#c7ddef}
      .list-group-item.active:hover .list-group-item-text{color:#c7ddef}
      a.list-group-item-success:focus{color:#3c763d;background-color:#d0e9c6}
      a.list-group-item-success:hover{color:#3c763d;background-color:#d0e9c6}
      button.list-group-item-success:focus{color:#3c763d;background-color:#d0e9c6}
      button.list-group-item-success:hover{color:#3c763d;background-color:#d0e9c6}
      a.list-group-item-success.active:focus{color:#fff;background-color:#3c763d;border-color:#3c763d}
      a.list-group-item-success.active:hover{color:#fff;background-color:#3c763d;border-color:#3c763d}
      button.list-group-item-success.active:focus{color:#fff;background-color:#3c763d;border-color:#3c763d}
      button.list-group-item-success.active:hover{color:#fff;background-color:#3c763d;border-color:#3c763d}
      a.list-group-item-info:focus{color:#31708f;background-color:#c4e3f3}
      a.list-group-item-info:hover{color:#31708f;background-color:#c4e3f3}
      button.list-group-item-info:focus{color:#31708f;background-color:#c4e3f3}
      button.list-group-item-info:hover{color:#31708f;background-color:#c4e3f3}
      a.list-group-item-info.active:focus{color:#fff;background-color:#31708f;border-color:#31708f}
      a.list-group-item-info.active:hover{color:#fff;background-color:#31708f;border-color:#31708f}
      button.list-group-item-info.active:focus{color:#fff;background-color:#31708f;border-color:#31708f}
      button.list-group-item-info.active:hover{color:#fff;background-color:#31708f;border-color:#31708f}
      a.list-group-item-warning:focus{color:#8a6d3b;background-color:#faf2cc}
      a.list-group-item-warning:hover{color:#8a6d3b;background-color:#faf2cc}
      button.list-group-item-warning:focus{color:#8a6d3b;background-color:#faf2cc}
      button.list-group-item-warning:hover{color:#8a6d3b;background-color:#faf2cc}
      a.list-group-item-warning.active:focus{color:#fff;background-color:#8a6d3b;border-color:#8a6d3b}
      a.list-group-item-warning.active:hover{color:#fff;background-color:#8a6d3b;border-color:#8a6d3b}
      button.list-group-item-warning.active:focus{color:#fff;background-color:#8a6d3b;border-color:#8a6d3b}
      button.list-group-item-warning.active:hover{color:#fff;background-color:#8a6d3b;border-color:#8a6d3b}
      a.list-group-item-danger:focus{color:#a94442;background-color:#ebcccc}
      a.list-group-item-danger:hover{color:#a94442;background-color:#ebcccc}
      button.list-group-item-danger:focus{color:#a94442;background-color:#ebcccc}
      button.list-group-item-danger:hover{color:#a94442;background-color:#ebcccc}
      a.list-group-item-danger.active:focus{color:#fff;background-color:#a94442;border-color:#a94442}
      a.list-group-item-danger.active:hover{color:#fff;background-color:#a94442;border-color:#a94442}
      button.list-group-item-danger.active:focus{color:#fff;background-color:#a94442;border-color:#a94442}
      button.list-group-item-danger.active:hover{color:#fff;background-color:#a94442;border-color:#a94442}
      .close:focus{color:#000;text-decoration:none;cursor:pointer;filter:alpha(opacity=50);opacity:.5}
      .close:hover{color:#000;text-decoration:none;cursor:pointer;filter:alpha(opacity=50);opacity:.5}
      .popover > .arrow:after{position:absolute;display:block;width:0;height:0;border-color:transparent;border-style:solid}
      .popover > .arrow:after{content:"";border-width:10px}
      .popover.top > .arrow:after{bottom:1px;margin-left:-10px;content:" ";border-top-color:#fff;border-bottom-width:0}
      .popover.right > .arrow:after{bottom:-10px;left:1px;content:" ";border-right-color:#fff;border-left-width:0}
      .popover.bottom > .arrow:after{top:1px;margin-left:-10px;content:" ";border-top-width:0;border-bottom-color:#fff}
      .popover.left > .arrow:after{right:1px;bottom:-10px;content:" ";border-right-width:0;border-left-color:#fff}
      .carousel-control:focus{color:#fff;text-decoration:none;filter:alpha(opacity=90);outline:0;opacity:.9}
      .carousel-control:hover{color:#fff;text-decoration:none;filter:alpha(opacity=90);outline:0;opacity:.9}
      .carousel-control .icon-prev:before{content:"\2039"}
      .carousel-control .icon-next:before{content:"\203A"}
      .btn-group-vertical > .btn-group:after{display:table;content:" "}
      .btn-group-vertical > .btn-group:before{display:table;content:" "}
      .btn-toolbar:after{display:table;content:" "}
      .btn-toolbar:before{display:table;content:" "}
      .clearfix:after{display:table;content:" "}
      .clearfix:before{display:table;content:" "}
      .container-fluid:after{display:table;content:" "}
      .container-fluid:before{display:table;content:" "}
      .container:after{display:table;content:" "}
      .container:before{display:table;content:" "}
      .dl-horizontal dd:after{display:table;content:" "}
      .dl-horizontal dd:before{display:table;content:" "}
      .form-horizontal .form-group:after{display:table;content:" "}
      .form-horizontal .form-group:before{display:table;content:" "}
      .modal-footer:after{display:table;content:" "}
      .modal-footer:before{display:table;content:" "}
      .modal-header:after{display:table;content:" "}
      .modal-header:before{display:table;content:" "}
      .nav:after{display:table;content:" "}
      .nav:before{display:table;content:" "}
      .navbar-collapse:after{display:table;content:" "}
      .navbar-collapse:before{display:table;content:" "}
      .navbar-header:after{display:table;content:" "}
      .navbar-header:before{display:table;content:" "}
      .navbar:after{display:table;content:" "}
      .navbar:before{display:table;content:" "}
      .pager:after{display:table;content:" "}
      .pager:before{display:table;content:" "}
      .panel-body:after{display:table;content:" "}
      .panel-body:before{display:table;content:" "}
      .row:after{display:table;content:" "}
      .row:before{display:table;content:" "}
      .btn-group-vertical > .btn-group:after{clear:both}
      .btn-toolbar:after{clear:both}
      .clearfix:after{clear:both}
      .container-fluid:after{clear:both}
      .container:after{clear:both}
      .dl-horizontal dd:after{clear:both}
      .form-horizontal .form-group:after{clear:both}
      .modal-footer:after{clear:both}
      .modal-header:after{clear:both}
      .nav:after{clear:both}
      .navbar-collapse:after{clear:both}
      .navbar-header:after{clear:both}
      .navbar:after{clear:both}
      .pager:after{clear:both}
      .panel-body:after{clear:both}
      .row:after{clear:both}
      .home-tile:hover{background:#dae3ee}
      .loading .anet section:before{content:"Loading...";visibility:visible;font-size:2rem}
      .leaflet-bar a:hover{background-color:#fff;border-bottom:1px solid #ccc;width:26px;height:26px;line-height:26px;display:block;text-align:center;text-decoration:none;color:#000}
      .leaflet-bar a:hover{background-color:#f4f4f4}
      .leaflet-control-attribution a:hover{text-decoration:underline}
      .leaflet-container a.leaflet-popup-close-button:hover{color:#999}
      .leaflet-tooltip-bottom:before{position:absolute;pointer-events:none;border:6px solid transparent;background:transparent;content:""}
      .leaflet-tooltip-left:before{position:absolute;pointer-events:none;border:6px solid transparent;background:transparent;content:""}
      .leaflet-tooltip-right:before{position:absolute;pointer-events:none;border:6px solid transparent;background:transparent;content:""}
      .leaflet-tooltip-top:before{position:absolute;pointer-events:none;border:6px solid transparent;background:transparent;content:""}
      .leaflet-tooltip-bottom:before{left:50%;margin-left:-6px}
      .leaflet-tooltip-top:before{left:50%;margin-left:-6px}
      .leaflet-tooltip-top:before{bottom:0;margin-bottom:-12px;border-top-color:#fff}
      .leaflet-tooltip-bottom:before{top:0;margin-top:-12px;margin-left:-6px;border-bottom-color:#fff}
      .leaflet-tooltip-left:before{top:50%;margin-top:-6px}
      .leaflet-tooltip-right:before{top:50%;margin-top:-6px}
      .leaflet-tooltip-left:before{right:0;margin-right:-12px;border-left-color:#fff}
      .leaflet-tooltip-right:before{left:0;margin-left:-12px;border-right-color:#fff}
      .react-autosuggest__input:focus{outline:none}
    </style>
    <style type="text/css">
      /*! Source: https://github.com/h5bp/html5-boilerplate/blob/master/src/css/main.css */
          @media print {
              * , :after, :before {
                  color: #000 !important;
                  text-shadow: none !important;
                  background: transparent !important;
                  box-shadow: none !important
              }
              a, a:visited {
                  text-decoration: underline
              }
              a[href]:after {
                  content: " (" attr(href) ")"
              }
              abbr[title]:after {
                  content: " (" attr(title) ")"
              }
              a[href^="#"]:after, a[href^="javascript:"]:after {
                  content: ""
              }
              blockquote, pre {
                  border: 1px solid #999;
                  page-break-inside: avoid
              }
              thead {
                  display: table-header-group
              }
              img, tr {
                  page-break-inside: avoid
              }
              img {
                  max-width: 100% !important
              }
              h2, h3, p {
                  orphans: 3;
                  widows: 3
              }
              h2, h3 {
                  page-break-after: avoid
              }
              .navbar {
                  display: none
              }
              .btn > .caret, .dropup > .btn > .caret {
                  border-top-color: #000 !important
              }
              .label {
                  border: 1px solid #000
              }
              .table {
                  border-collapse: collapse !important
              }
              .table td, .table th {
                  background-color: #fff !important
              }
              .table-bordered td, .table-bordered th {
                  border: 1px solid #ddd !important
              }
          }
          @font-face {
              font-family: Glyphicons Halflings;
              src: url(/assets/client/static/media/glyphicons-halflings-regular.f4769f9b.eot);
              src: url(/assets/client/static/media/glyphicons-halflings-regular.f4769f9b.eot?#iefix) format("embedded-opentype"), url(/assets/client/static/media/glyphicons-halflings-regular.448c34a5.woff2) format("woff2"), url(/assets/client/static/media/glyphicons-halflings-regular.fa277232.woff) format("woff"), url(/assets/client/static/media/glyphicons-halflings-regular.e18bbf61.ttf) format("truetype"), url(/assets/client/static/media/glyphicons-halflings-regular.89889688.svg#glyphicons_halflingsregular) format("svg")
          }
          @media (min-width:768px) {
              .lead {
                  font-size: 21px
              }
          }
          @media (min-width:768px) {
              .dl-horizontal dt {
                  float: left;
                  width: 160px;
                  overflow: hidden;
                  clear: left;
                  text-align: right;
                  text-overflow: ellipsis;
                  white-space: nowrap
              }
              .dl-horizontal dd {
                  margin-left: 180px
              }
          }
          @media (min-width:768px) {
              .container {
                  width: 750px
              }
          }
          @media (min-width:992px) {
              .container {
                  width: 970px
              }
          }
          @media (min-width:1200px) {
              .container {
                  width: 1170px
              }
          }
          @media (min-width:768px) {
              .col-sm-1, .col-sm-2, .col-sm-3, .col-sm-4, .col-sm-5, .col-sm-6,
              .col-sm-7, .col-sm-8, .col-sm-9, .col-sm-10, .col-sm-11, .col-sm-12 {
                  float: left
              }
              .col-sm-12 {
                  width: 100%
              }
              .col-sm-11 {
                  width: 91.66666667%
              }
              .col-sm-10 {
                  width: 83.33333333%
              }
              .col-sm-9 {
                  width: 75%
              }
              .col-sm-8 {
                  width: 66.66666667%
              }
              .col-sm-7 {
                  width: 58.33333333%
              }
              .col-sm-6 {
                  width: 50%
              }
              .col-sm-5 {
                  width: 41.66666667%
              }
              .col-sm-4 {
                  width: 33.33333333%
              }
              .col-sm-3 {
                  width: 25%
              }
              .col-sm-2 {
                  width: 16.66666667%
              }
              .col-sm-1 {
                  width: 8.33333333%
              }
              .col-sm-pull-12 {
                  right: 100%
              }
              .col-sm-pull-11 {
                  right: 91.66666667%
              }
              .col-sm-pull-10 {
                  right: 83.33333333%
              }
              .col-sm-pull-9 {
                  right: 75%
              }
              .col-sm-pull-8 {
                  right: 66.66666667%
              }
              .col-sm-pull-7 {
                  right: 58.33333333%
              }
              .col-sm-pull-6 {
                  right: 50%
              }
              .col-sm-pull-5 {
                  right: 41.66666667%
              }
              .col-sm-pull-4 {
                  right: 33.33333333%
              }
              .col-sm-pull-3 {
                  right: 25%
              }
              .col-sm-pull-2 {
                  right: 16.66666667%
              }
              .col-sm-pull-1 {
                  right: 8.33333333%
              }
              .col-sm-pull-0 {
                  right: auto
              }
              .col-sm-push-12 {
                  left: 100%
              }
              .col-sm-push-11 {
                  left: 91.66666667%
              }
              .col-sm-push-10 {
                  left: 83.33333333%
              }
              .col-sm-push-9 {
                  left: 75%
              }
              .col-sm-push-8 {
                  left: 66.66666667%
              }
              .col-sm-push-7 {
                  left: 58.33333333%
              }
              .col-sm-push-6 {
                  left: 50%
              }
              .col-sm-push-5 {
                  left: 41.66666667%
              }
              .col-sm-push-4 {
                  left: 33.33333333%
              }
              .col-sm-push-3 {
                  left: 25%
              }
              .col-sm-push-2 {
                  left: 16.66666667%
              }
              .col-sm-push-1 {
                  left: 8.33333333%
              }
              .col-sm-push-0 {
                  left: auto
              }
              .col-sm-offset-12 {
                  margin-left: 100%
              }
              .col-sm-offset-11 {
                  margin-left: 91.66666667%
              }
              .col-sm-offset-10 {
                  margin-left: 83.33333333%
              }
              .col-sm-offset-9 {
                  margin-left: 75%
              }
              .col-sm-offset-8 {
                  margin-left: 66.66666667%
              }
              .col-sm-offset-7 {
                  margin-left: 58.33333333%
              }
              .col-sm-offset-6 {
                  margin-left: 50%
              }
              .col-sm-offset-5 {
                  margin-left: 41.66666667%
              }
              .col-sm-offset-4 {
                  margin-left: 33.33333333%
              }
              .col-sm-offset-3 {
                  margin-left: 25%
              }
              .col-sm-offset-2 {
                  margin-left: 16.66666667%
              }
              .col-sm-offset-1 {
                  margin-left: 8.33333333%
              }
              .col-sm-offset-0 {
                  margin-left: 0
              }
          }
          @media (min-width:992px) {
              .col-md-1, .col-md-2, .col-md-3, .col-md-4, .col-md-5, .col-md-6,
              .col-md-7, .col-md-8, .col-md-9, .col-md-10, .col-md-11, .col-md-12 {
                  float: left
              }
              .col-md-12 {
                  width: 100%
              }
              .col-md-11 {
                  width: 91.66666667%
              }
              .col-md-10 {
                  width: 83.33333333%
              }
              .col-md-9 {
                  width: 75%
              }
              .col-md-8 {
                  width: 66.66666667%
              }
              .col-md-7 {
                  width: 58.33333333%
              }
              .col-md-6 {
                  width: 50%
              }
              .col-md-5 {
                  width: 41.66666667%
              }
              .col-md-4 {
                  width: 33.33333333%
              }
              .col-md-3 {
                  width: 25%
              }
              .col-md-2 {
                  width: 16.66666667%
              }
              .col-md-1 {
                  width: 8.33333333%
              }
              .col-md-pull-12 {
                  right: 100%
              }
              .col-md-pull-11 {
                  right: 91.66666667%
              }
              .col-md-pull-10 {
                  right: 83.33333333%
              }
              .col-md-pull-9 {
                  right: 75%
              }
              .col-md-pull-8 {
                  right: 66.66666667%
              }
              .col-md-pull-7 {
                  right: 58.33333333%
              }
              .col-md-pull-6 {
                  right: 50%
              }
              .col-md-pull-5 {
                  right: 41.66666667%
              }
              .col-md-pull-4 {
                  right: 33.33333333%
              }
              .col-md-pull-3 {
                  right: 25%
              }
              .col-md-pull-2 {
                  right: 16.66666667%
              }
              .col-md-pull-1 {
                  right: 8.33333333%
              }
              .col-md-pull-0 {
                  right: auto
              }
              .col-md-push-12 {
                  left: 100%
              }
              .col-md-push-11 {
                  left: 91.66666667%
              }
              .col-md-push-10 {
                  left: 83.33333333%
              }
              .col-md-push-9 {
                  left: 75%
              }
              .col-md-push-8 {
                  left: 66.66666667%
              }
              .col-md-push-7 {
                  left: 58.33333333%
              }
              .col-md-push-6 {
                  left: 50%
              }
              .col-md-push-5 {
                  left: 41.66666667%
              }
              .col-md-push-4 {
                  left: 33.33333333%
              }
              .col-md-push-3 {
                  left: 25%
              }
              .col-md-push-2 {
                  left: 16.66666667%
              }
              .col-md-push-1 {
                  left: 8.33333333%
              }
              .col-md-push-0 {
                  left: auto
              }
              .col-md-offset-12 {
                  margin-left: 100%
              }
              .col-md-offset-11 {
                  margin-left: 91.66666667%
              }
              .col-md-offset-10 {
                  margin-left: 83.33333333%
              }
              .col-md-offset-9 {
                  margin-left: 75%
              }
              .col-md-offset-8 {
                  margin-left: 66.66666667%
              }
              .col-md-offset-7 {
                  margin-left: 58.33333333%
              }
              .col-md-offset-6 {
                  margin-left: 50%
              }
              .col-md-offset-5 {
                  margin-left: 41.66666667%
              }
              .col-md-offset-4 {
                  margin-left: 33.33333333%
              }
              .col-md-offset-3 {
                  margin-left: 25%
              }
              .col-md-offset-2 {
                  margin-left: 16.66666667%
              }
              .col-md-offset-1 {
                  margin-left: 8.33333333%
              }
              .col-md-offset-0 {
                  margin-left: 0
              }
          }
          @media (min-width:1200px) {
              .col-lg-1, .col-lg-2, .col-lg-3, .col-lg-4, .col-lg-5, .col-lg-6,
              .col-lg-7, .col-lg-8, .col-lg-9, .col-lg-10, .col-lg-11, .col-lg-12 {
                  float: left
              }
              .col-lg-12 {
                  width: 100%
              }
              .col-lg-11 {
                  width: 91.66666667%
              }
              .col-lg-10 {
                  width: 83.33333333%
              }
              .col-lg-9 {
                  width: 75%
              }
              .col-lg-8 {
                  width: 66.66666667%
              }
              .col-lg-7 {
                  width: 58.33333333%
              }
              .col-lg-6 {
                  width: 50%
              }
              .col-lg-5 {
                  width: 41.66666667%
              }
              .col-lg-4 {
                  width: 33.33333333%
              }
              .col-lg-3 {
                  width: 25%
              }
              .col-lg-2 {
                  width: 16.66666667%
              }
              .col-lg-1 {
                  width: 8.33333333%
              }
              .col-lg-pull-12 {
                  right: 100%
              }
              .col-lg-pull-11 {
                  right: 91.66666667%
              }
              .col-lg-pull-10 {
                  right: 83.33333333%
              }
              .col-lg-pull-9 {
                  right: 75%
              }
              .col-lg-pull-8 {
                  right: 66.66666667%
              }
              .col-lg-pull-7 {
                  right: 58.33333333%
              }
              .col-lg-pull-6 {
                  right: 50%
              }
              .col-lg-pull-5 {
                  right: 41.66666667%
              }
              .col-lg-pull-4 {
                  right: 33.33333333%
              }
              .col-lg-pull-3 {
                  right: 25%
              }
              .col-lg-pull-2 {
                  right: 16.66666667%
              }
              .col-lg-pull-1 {
                  right: 8.33333333%
              }
              .col-lg-pull-0 {
                  right: auto
              }
              .col-lg-push-12 {
                  left: 100%
              }
              .col-lg-push-11 {
                  left: 91.66666667%
              }
              .col-lg-push-10 {
                  left: 83.33333333%
              }
              .col-lg-push-9 {
                  left: 75%
              }
              .col-lg-push-8 {
                  left: 66.66666667%
              }
              .col-lg-push-7 {
                  left: 58.33333333%
              }
              .col-lg-push-6 {
                  left: 50%
              }
              .col-lg-push-5 {
                  left: 41.66666667%
              }
              .col-lg-push-4 {
                  left: 33.33333333%
              }
              .col-lg-push-3 {
                  left: 25%
              }
              .col-lg-push-2 {
                  left: 16.66666667%
              }
              .col-lg-push-1 {
                  left: 8.33333333%
              }
              .col-lg-push-0 {
                  left: auto
              }
              .col-lg-offset-12 {
                  margin-left: 100%
              }
              .col-lg-offset-11 {
                  margin-left: 91.66666667%
              }
              .col-lg-offset-10 {
                  margin-left: 83.33333333%
              }
              .col-lg-offset-9 {
                  margin-left: 75%
              }
              .col-lg-offset-8 {
                  margin-left: 66.66666667%
              }
              .col-lg-offset-7 {
                  margin-left: 58.33333333%
              }
              .col-lg-offset-6 {
                  margin-left: 50%
              }
              .col-lg-offset-5 {
                  margin-left: 41.66666667%
              }
              .col-lg-offset-4 {
                  margin-left: 33.33333333%
              }
              .col-lg-offset-3 {
                  margin-left: 25%
              }
              .col-lg-offset-2 {
                  margin-left: 16.66666667%
              }
              .col-lg-offset-1 {
                  margin-left: 8.33333333%
              }
              .col-lg-offset-0 {
                  margin-left: 0
              }
          }
          @media screen and (max-width:767px) {
              .table-responsive {
                  width: 100%;
                  margin-bottom: 15px;
                  overflow-y: hidden;
                  -ms-overflow-style: -ms-autohiding-scrollbar;
                  border: 1px solid #ddd
              }
              .table-responsive > .table {
                  margin-bottom: 0
              }
              .table-responsive > .table > tbody > tr > td, .table-responsive > .table > tbody > tr > th,
              .table-responsive > .table > tfoot > tr > td, .table-responsive > .table > tfoot > tr > th,
              .table-responsive > .table > thead > tr > td, .table-responsive > .table > thead > tr > th {
                  white-space: nowrap
              }
              .table-responsive > .table-bordered {
                  border: 0
              }
              .table-responsive > .table-bordered > tbody > tr > td:first-child, .table-responsive > .table-bordered > tbody > tr > th:first-child,
              .table-responsive > .table-bordered > tfoot > tr > td:first-child, .table-responsive > .table-bordered > tfoot > tr > th:first-child,
              .table-responsive > .table-bordered > thead > tr > td:first-child, .table-responsive > .table-bordered > thead > tr > th:first-child {
                  border-left: 0
              }
              .table-responsive > .table-bordered > tbody > tr > td:last-child, .table-responsive > .table-bordered > tbody > tr > th:last-child,
              .table-responsive > .table-bordered > tfoot > tr > td:last-child, .table-responsive > .table-bordered > tfoot > tr > th:last-child,
              .table-responsive > .table-bordered > thead > tr > td:last-child, .table-responsive > .table-bordered > thead > tr > th:last-child {
                  border-right: 0
              }
              .table-responsive > .table-bordered > tbody > tr:last-child > td, .table-responsive > .table-bordered > tbody > tr:last-child > th,
              .table-responsive > .table-bordered > tfoot > tr:last-child > td, .table-responsive > .table-bordered > tfoot > tr:last-child > th {
                  border-bottom: 0
              }
          }
          @media screen and (-webkit-min-device-pixel-ratio:0) {
              input[type=date].form-control, input[type=datetime-local].form-control,
              input[type=month].form-control, input[type=time].form-control {
                  line-height: 34px
              }
              .input-group-sm input[type=date], .input-group-sm input[type=datetime-local],
              .input-group-sm input[type=month], .input-group-sm input[type=time],
              input[type=date].input-sm, input[type=datetime-local].input-sm,
              input[type=month].input-sm, input[type=time].input-sm {
                  line-height: 30px
              }
              .input-group-lg input[type=date], .input-group-lg input[type=datetime-local],
              .input-group-lg input[type=month], .input-group-lg input[type=time],
              input[type=date].input-lg, input[type=datetime-local].input-lg,
              input[type=month].input-lg, input[type=time].input-lg {
                  line-height: 46px
              }
          }
          @media (min-width:768px) {
              .form-inline .form-group {
                  display: inline-block;
                  margin-bottom: 0;
                  vertical-align: middle
              }
              .form-inline .form-control {
                  display: inline-block;
                  width: auto;
                  vertical-align: middle
              }
              .form-inline .form-control-static {
                  display: inline-block
              }
              .form-inline .input-group {
                  display: inline-table;
                  vertical-align: middle
              }
              .form-inline .input-group .form-control, .form-inline .input-group .input-group-addon,
              .form-inline .input-group .input-group-btn {
                  width: auto
              }
              .form-inline .input-group > .form-control {
                  width: 100%
              }
              .form-inline .control-label {
                  margin-bottom: 0;
                  vertical-align: middle
              }
              .form-inline .checkbox, .form-inline .radio {
                  display: inline-block;
                  margin-top: 0;
                  margin-bottom: 0;
                  vertical-align: middle
              }
              .form-inline .checkbox label, .form-inline .radio label {
                  padding-left: 0
              }
              .form-inline .checkbox input[type=checkbox], .form-inline .radio input[type=radio] {
                  position: relative;
                  margin-left: 0
              }
              .form-inline .has-feedback .form-control-feedback {
                  top: 0
              }
          }
          @media (min-width:768px) {
              .form-horizontal .control-label {
                  padding-top: 7px;
                  margin-bottom: 0;
                  text-align: right
              }
          }
          @media (min-width:768px) {
              .form-horizontal .form-group-lg .control-label {
                  padding-top: 11px;
                  font-size: 18px
              }
          }
          @media (min-width:768px) {
              .form-horizontal .form-group-sm .control-label {
                  padding-top: 6px;
                  font-size: 12px
              }
          }
          @media (min-width:768px) {
              .navbar-right .dropdown-menu {
                  right: 0;
                  left: auto
              }
              .navbar-right .dropdown-menu-left {
                  right: auto;
                  left: 0
              }
          }
          @media (min-width:768px) {
              .nav-tabs.nav-justified > li {
                  display: table-cell;
                  width: 1%
              }
              .nav-tabs.nav-justified > li > a {
                  margin-bottom: 0
              }
          }
          @media (min-width:768px) {
              .nav-tabs.nav-justified > li > a {
                  border-bottom: 1px solid #ddd;
                  border-radius: 4px 4px 0 0
              }
              .nav-tabs.nav-justified > .active > a, .nav-tabs.nav-justified > .active > a:focus,
              .nav-tabs.nav-justified > .active > a:hover {
                  border-bottom-color: #fff
              }
          }
          @media (min-width:768px) {
              .nav-justified > li {
                  display: table-cell;
                  width: 1%
              }
              .nav-justified > li > a {
                  margin-bottom: 0
              }
          }
          @media (min-width:768px) {
              .nav-tabs-justified > li > a {
                  border-bottom: 1px solid #ddd;
                  border-radius: 4px 4px 0 0
              }
              .nav-tabs-justified > .active > a, .nav-tabs-justified > .active > a:focus,
              .nav-tabs-justified > .active > a:hover {
                  border-bottom-color: #fff
              }
          }
          @media (min-width:768px) {
              .navbar {
                  border-radius: 4px
              }
          }
          @media (min-width:768px) {
              .navbar-header {
                  float: left
              }
          }
          @media (min-width:768px) {
              .navbar-collapse {
                  width: auto;
                  border-top: 0;
                  box-shadow: none
              }
              .navbar-collapse.collapse {
                  display: block !important;
                  height: auto !important;
                  padding-bottom: 0;
                  overflow: visible !important
              }
              .navbar-collapse.in {
                  overflow-y: visible
              }
              .navbar-fixed-bottom .navbar-collapse, .navbar-fixed-top .navbar-collapse,
              .navbar-static-top .navbar-collapse {
                  padding-right: 0;
                  padding-left: 0
              }
          }
          @media (max-device-width:480px) and (orientation:landscape) {
              .navbar-fixed-bottom .navbar-collapse, .navbar-fixed-top .navbar-collapse {
                  max-height: 200px
              }
          }
          @media (min-width:768px) {
              .container-fluid > .navbar-collapse, .container-fluid > .navbar-header,
              .container > .navbar-collapse, .container > .navbar-header {
                  margin-right: 0;
                  margin-left: 0
              }
          }
          @media (min-width:768px) {
              .navbar-static-top {
                  border-radius: 0
              }
          }
          @media (min-width:768px) {
              .navbar-fixed-bottom, .navbar-fixed-top {
                  border-radius: 0
              }
          }
          @media (min-width:768px) {
              .navbar > .container-fluid .navbar-brand, .navbar > .container .navbar-brand {
                  margin-left: -15px
              }
          }
          @media (min-width:768px) {
              .navbar-toggle {
                  display: none
              }
          }
          @media (max-width:767px) {
              .navbar-nav .open .dropdown-menu {
                  position: static;
                  float: none;
                  width: auto;
                  margin-top: 0;
                  background-color: transparent;
                  border: 0;
                  box-shadow: none
              }
              .navbar-nav .open .dropdown-menu .dropdown-header, .navbar-nav .open .dropdown-menu > li > a {
                  padding: 5px 15px 5px 25px
              }
              .navbar-nav .open .dropdown-menu > li > a {
                  line-height: 20px
              }
              .navbar-nav .open .dropdown-menu > li > a:focus, .navbar-nav .open .dropdown-menu > li > a:hover {
                  background-image: none
              }
          }
          @media (min-width:768px) {
              .navbar-nav {
                  float: left;
                  margin: 0
              }
              .navbar-nav > li {
                  float: left
              }
              .navbar-nav > li > a {
                  padding-top: 15px;
                  padding-bottom: 15px
              }
          }
          @media (min-width:768px) {
              .navbar-form .form-group {
                  display: inline-block;
                  margin-bottom: 0;
                  vertical-align: middle
              }
              .navbar-form .form-control {
                  display: inline-block;
                  width: auto;
                  vertical-align: middle
              }
              .navbar-form .form-control-static {
                  display: inline-block
              }
              .navbar-form .input-group {
                  display: inline-table;
                  vertical-align: middle
              }
              .navbar-form .input-group .form-control, .navbar-form .input-group .input-group-addon,
              .navbar-form .input-group .input-group-btn {
                  width: auto
              }
              .navbar-form .input-group > .form-control {
                  width: 100%
              }
              .navbar-form .control-label {
                  margin-bottom: 0;
                  vertical-align: middle
              }
              .navbar-form .checkbox, .navbar-form .radio {
                  display: inline-block;
                  margin-top: 0;
                  margin-bottom: 0;
                  vertical-align: middle
              }
              .navbar-form .checkbox label, .navbar-form .radio label {
                  padding-left: 0
              }
              .navbar-form .checkbox input[type=checkbox], .navbar-form .radio input[type=radio] {
                  position: relative;
                  margin-left: 0
              }
              .navbar-form .has-feedback .form-control-feedback {
                  top: 0
              }
          }
          @media (max-width:767px) {
              .navbar-form .form-group {
                  margin-bottom: 5px
              }
              .navbar-form .form-group:last-child {
                  margin-bottom: 0
              }
          }
          @media (min-width:768px) {
              .navbar-form {
                  width: auto;
                  padding-top: 0;
                  padding-bottom: 0;
                  margin-right: 0;
                  margin-left: 0;
                  border: 0;
                  box-shadow: none
              }
          }
          @media (min-width:768px) {
              .navbar-text {
                  float: left;
                  margin-right: 15px;
                  margin-left: 15px
              }
          }
          @media (min-width:768px) {
              .navbar-left {
                  float: left !important
              }
              .navbar-right {
                  float: right !important;
                  margin-right: -15px
              }
              .navbar-right ~ .navbar-right {
                  margin-right: 0
              }
          }
          @media (max-width:767px) {
              .navbar-default .navbar-nav .open .dropdown-menu > li > a {
                  color: #777
              }
              .navbar-default .navbar-nav .open .dropdown-menu > li > a:focus, .navbar-default .navbar-nav .open .dropdown-menu > li > a:hover {
                  color: #333;
                  background-color: transparent
              }
              .navbar-default .navbar-nav .open .dropdown-menu > .active > a, .navbar-default .navbar-nav .open .dropdown-menu > .active > a:focus,
              .navbar-default .navbar-nav .open .dropdown-menu > .active > a:hover {
                  color: #555;
                  background-color: #e7e7e7
              }
              .navbar-default .navbar-nav .open .dropdown-menu > .disabled > a, .navbar-default .navbar-nav .open .dropdown-menu > .disabled > a:focus,
              .navbar-default .navbar-nav .open .dropdown-menu > .disabled > a:hover {
                  color: #ccc;
                  background-color: transparent
              }
          }
          @media (max-width:767px) {
              .navbar-inverse .navbar-nav .open .dropdown-menu > .dropdown-header {
                  border-color: #080808
              }
              .navbar-inverse .navbar-nav .open .dropdown-menu .divider {
                  background-color: #080808
              }
              .navbar-inverse .navbar-nav .open .dropdown-menu > li > a {
                  color: #9d9d9d
              }
              .navbar-inverse .navbar-nav .open .dropdown-menu > li > a:focus, .navbar-inverse .navbar-nav .open .dropdown-menu > li > a:hover {
                  color: #fff;
                  background-color: transparent
              }
              .navbar-inverse .navbar-nav .open .dropdown-menu > .active > a, .navbar-inverse .navbar-nav .open .dropdown-menu > .active > a:focus,
              .navbar-inverse .navbar-nav .open .dropdown-menu > .active > a:hover {
                  color: #fff;
                  background-color: #080808
              }
              .navbar-inverse .navbar-nav .open .dropdown-menu > .disabled > a, .navbar-inverse .navbar-nav .open .dropdown-menu > .disabled > a:focus,
              .navbar-inverse .navbar-nav .open .dropdown-menu > .disabled > a:hover {
                  color: #444;
                  background-color: transparent
              }
          }
          @media screen and (min-width:768px) {
              .jumbotron {
                  padding-top: 48px;
                  padding-bottom: 48px
              }
              .container-fluid .jumbotron, .container .jumbotron {
                  padding-right: 60px;
                  padding-left: 60px
              }
              .jumbotron .h1, .jumbotron h1 {
                  font-size: 63px
              }
          }
          @-webkit-keyframes progress-bar-stripes {
              0% {
                  background-position: 40px 0
              }
              to {
                  background-position: 0 0
              }
          }
          @keyframes progress-bar-stripes {
              0% {
                  background-position: 40px 0
              }
              to {
                  background-position: 0 0
              }
          }
          @media (min-width:768px) {
              .modal-dialog {
                  width: 600px;
                  margin: 30px auto
              }
              .modal-content {
                  box-shadow: 0 5px 15px rgba(0, 0, 0, .5)
              }
              .modal-sm {
                  width: 300px
              }
          }
          @media (min-width:992px) {
              .modal-lg {
                  width: 900px
              }
          }
          @media (-webkit-transform-3d), all and (transform-3d) {
              .carousel-inner > .item {
                  -webkit-transition: -webkit-transform .6s ease-in-out;
                  transition: -webkit-transform .6s ease-in-out;
                  transition: transform .6s ease-in-out;
                  transition: transform .6s ease-in-out, -webkit-transform .6s ease-in-out;
                  -webkit-backface-visibility: hidden;
                  backface-visibility: hidden;
                  -webkit-perspective: 1000px;
                  perspective: 1000px
              }
              .carousel-inner > .item.active.right, .carousel-inner > .item.next {
                  left: 0;
                  -webkit-transform: translate3d(100%, 0, 0);
                  transform: translate3d(100%, 0, 0)
              }
              .carousel-inner > .item.active.left, .carousel-inner > .item.prev {
                  left: 0;
                  -webkit-transform: translate3d(-100%, 0, 0);
                  transform: translate3d(-100%, 0, 0)
              }
              .carousel-inner > .item.active, .carousel-inner > .item.next.left,
              .carousel-inner > .item.prev.right {
                  left: 0;
                  -webkit-transform: translateZ(0);
                  transform: translateZ(0)
              }
          }
          @media screen and (min-width:768px) {
              .carousel-control .glyphicon-chevron-left, .carousel-control .glyphicon-chevron-right,
              .carousel-control .icon-next, .carousel-control .icon-prev {
                  width: 30px;
                  height: 30px;
                  margin-top: -10px;
                  font-size: 30px
              }
              .carousel-control .glyphicon-chevron-left, .carousel-control .icon-prev {
                  margin-left: -10px
              }
              .carousel-control .glyphicon-chevron-right, .carousel-control .icon-next {
                  margin-right: -10px
              }
              .carousel-caption {
                  right: 20%;
                  left: 20%;
                  padding-bottom: 30px
              }
              .carousel-indicators {
                  bottom: 20px
              }
          }
          @-ms-viewport {
              width: device-width
          }
          @media (max-width:767px) {
              .visible-xs {
                  display: block !important
              }
              table.visible-xs {
                  display: table !important
              }
              tr.visible-xs {
                  display: table-row !important
              }
              td.visible-xs, th.visible-xs {
                  display: table-cell !important
              }
          }
          @media (max-width:767px) {
              .visible-xs-block {
                  display: block !important
              }
          }
          @media (max-width:767px) {
              .visible-xs-inline {
                  display: inline !important
              }
          }
          @media (max-width:767px) {
              .visible-xs-inline-block {
                  display: inline-block !important
              }
          }
          @media (min-width:768px) and (max-width:991px) {
              .visible-sm {
                  display: block !important
              }
              table.visible-sm {
                  display: table !important
              }
              tr.visible-sm {
                  display: table-row !important
              }
              td.visible-sm, th.visible-sm {
                  display: table-cell !important
              }
          }
          @media (min-width:768px) and (max-width:991px) {
              .visible-sm-block {
                  display: block !important
              }
          }
          @media (min-width:768px) and (max-width:991px) {
              .visible-sm-inline {
                  display: inline !important
              }
          }
          @media (min-width:768px) and (max-width:991px) {
              .visible-sm-inline-block {
                  display: inline-block !important
              }
          }
          @media (min-width:992px) and (max-width:1199px) {
              .visible-md {
                  display: block !important
              }
              table.visible-md {
                  display: table !important
              }
              tr.visible-md {
                  display: table-row !important
              }
              td.visible-md, th.visible-md {
                  display: table-cell !important
              }
          }
          @media (min-width:992px) and (max-width:1199px) {
              .visible-md-block {
                  display: block !important
              }
          }
          @media (min-width:992px) and (max-width:1199px) {
              .visible-md-inline {
                  display: inline !important
              }
          }
          @media (min-width:992px) and (max-width:1199px) {
              .visible-md-inline-block {
                  display: inline-block !important
              }
          }
          @media (min-width:1200px) {
              .visible-lg {
                  display: block !important
              }
              table.visible-lg {
                  display: table !important
              }
              tr.visible-lg {
                  display: table-row !important
              }
              td.visible-lg, th.visible-lg {
                  display: table-cell !important
              }
          }
          @media (min-width:1200px) {
              .visible-lg-block {
                  display: block !important
              }
          }
          @media (min-width:1200px) {
              .visible-lg-inline {
                  display: inline !important
              }
          }
          @media (min-width:1200px) {
              .visible-lg-inline-block {
                  display: inline-block !important
              }
          }
          @media (max-width:767px) {
              .hidden-xs {
                  display: none !important
              }
          }
          @media (min-width:768px) and (max-width:991px) {
              .hidden-sm {
                  display: none !important
              }
          }
          @media (min-width:992px) and (max-width:1199px) {
              .hidden-md {
                  display: none !important
              }
          }
          @media (min-width:1200px) {
              .hidden-lg {
                  display: none !important
              }
          }
          @media print {
              .visible-print {
                  display: block !important
              }
              table.visible-print {
                  display: table !important
              }
              tr.visible-print {
                  display: table-row !important
              }
              td.visible-print, th.visible-print {
                  display: table-cell !important
              }
          }
          @media print {
              .visible-print-block {
                  display: block !important
              }
          }
          @media print {
              .visible-print-inline {
                  display: inline !important
              }
          }
          @media print {
              .visible-print-inline-block {
                  display: inline-block !important
              }
          }
          @media print {
              .hidden-print {
                  display: none !important
              }
          }
    </style>
  </head>
  <body style="box-sizing:border-box;margin:0;font-family:Helvetica Neue, Helvetica, Arial, sans-serif;font-size:14px;line-height:1.42857143;color:#333;background-color:#fff;background:#f2f2f2;">
    <div class="container" style="box-sizing:border-box;padding-right:15px;padding-left:15px;margin-right:auto;margin-left:auto;max-width:1024px;">
      <div class="row" style="box-sizing:border-box;margin-right:-15px;margin-left:-15px;background-color: rgb(255, 255, 255); padding-top: 58px; height: 132px; box-shadow: rgba(0, 0, 0, 0.0980392) 0px 4px 3px 0px; z-index: 100; background-position: initial initial; background-repeat: initial initial;">
        <div class="col-xs-3" style="box-sizing:border-box;position:relative;min-height:1px;padding-right:15px;padding-left:15px;float:left;width:25%;">
          <#-- <a class="logo" href="${serverUrl}" style="box-sizing:border-box;background-color:transparent;color:#337ab7;text-decoration:none;"> -->
              <img alt="ANET logo" src="${serverUrl}/assets/img/anet.png" style="box-sizing:border-box;border:0;vertical-align:middle;height:36px">
          <#-- </a> -->
        </div>
      </div>
      <div class="row" style="box-sizing:border-box;margin-right:-15px;margin-left:-15px;">
        <div class="col-sm-12" style="box-sizing:border-box;position:relative;min-height:1px;padding-right:15px;padding-left:15px;">
          <div style="box-sizing:border-box;">
            <div style="box-sizing:border-box;"></div>
            <div class="form-horizontal row" style="box-sizing:border-box;margin-right:-15px;margin-left:-15px;margin: -30px 0px 0px;">

			  <#if comment??>
              <fieldset class="alert" style="box-sizing:border-box;padding:.35em .625em .75em;margin:0 2px;border:1px solid silver;min-width:0;margin:0;padding:0;border:0;background:#fff;border:1px solid #e0e0e0;padding:1.25em;margin:7rem 0;position:relative;padding:15px;margin-bottom:20px;border:1px solid transparent;border-radius:4px;border:3px solid #981B1E;">
                <legend style="box-sizing:border-box;padding:0;border:0;display:block;width:100%;margin-bottom:20px;font-size:21px;line-height:inherit;color:#333;border-bottom:1px solid #e5e5e5;position:absolute;top:-35px;left:3px;font-size:2.5rem;color:#363636;border:none;color:#981B1E !important;">
					Daily rollup notes:
				</legend>
                <div class="form-group" style="box-sizing:border-box;margin-bottom:15px;margin-right:-15px;margin-left:-15px;">
                  <div class="col-sm-10" style="box-sizing:border-box;position:relative;min-height:1px;padding-right:15px;padding-left:15px;">
					  ${comment}
                </div>
                </div>
              </fieldset>
			  </#if>

			  <#-- <a href="${serverUrl}/rollup" class="btn btn-primary pull-right">View on ANET</a> -->

              <fieldset style="box-sizing:border-box;padding:.35em .625em .75em;margin:0 2px;border:1px solid silver;min-width:0;margin:0;padding:0;border:0;background:#fff;border:1px solid #e0e0e0;padding:1.25em;margin:7rem 0;position:relative;">
                  <legend style="box-sizing:border-box;padding:0;border:0;display:block;width:100%;margin-bottom:20px;font-size:21px;line-height:inherit;color:#333;border-bottom:1px solid #e5e5e5;position:absolute;top:-35px;left:3px;font-size:2.5rem;color:#363636;border:none;">
                      ${subject}
                  </legend>

                <#list reports as report>
					<div class="row">
						<div class="col-md-6" style="float:left">
							<#-- <a href="${serverUrl}/organizations/${report.advisorOrg.id}"> -->
                                ${report.advisorOrg.longName}
                            <#-- </a> -->
                            ->
                            <#-- <a href="${serverUrl}/organizations/${report.principalOrg.id}"> -->
                                ${report.principalOrg.longName}
                            <#-- </a> -->
						</div>

						<div class="col-md-6" style="float:right;">
							${report.engagementDate} @
							<#-- <a href="${serverUrl}/locations/${report.location.id}"> -->
                                ${report.location.name}
                            <#-- </a> -->
						</div>
					</div>

					<div class="row">
						<div class="col-md-6" style="float:left;">
                            <#-- <a href="${serverUrl}/people/${report.primaryAdvisor.id}"> -->
                                ${(report.primaryAdvisor.rank)!}
                                ${(report.primaryAdvisor.name)!}
                            <#-- </a> -->
                        </div>

                        <div class="col-md-6" style="float:right;">
                            <#-- <a href="${serverUrl}/people/${report.primaryPrincipal.id}"> -->
                                ${(report.primaryPrincipal.name)!}
                                ${(report.primaryPrincipal.rank)!}
                            <#-- </a> -->
                        </div>
					</div>

                    <#list (report.poams)! as poam>
                    <div class="row">
                        <div class="col-xs-12">
                            <#-- <a href="${serverUrl}/poams/${poam.id}"> -->
                                ${poam.longName}
                            <#-- </a> -->
                        </div>
                    </div>
                    </#list>

                    <div class="row">
                        <div class="col-md-8">
                            <h3>${report.intent}</h3>
                            <#if report.keyOutcomes??>
                                <p><strong>Key outcomes:</strong> ${report.keyOutcomes}</p>
                            </#if>
                            <#if report.nextSteps??>
                                <p><strong>Next steps:</strong> ${report.nextSteps}</p>
                            </#if>
                        </div>
                    </div>

                    <#-- <a href="${serverUrl}/reports/${report.id}" class="read-full btn" style="float:right;"> -->
                        <#-- Read Full Report -->
                    <#-- </a> -->

                    <#sep><hr /></#sep>
				</#list>
              </fieldset>
            </div>
          </div>
        </div>
      </div>
    </div>
  </body>
</html>
