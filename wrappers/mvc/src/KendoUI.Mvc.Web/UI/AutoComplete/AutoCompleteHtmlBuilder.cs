﻿

namespace KendoUI.Mvc.UI
{
    using System.Web.Mvc;
    using KendoUI.Mvc.Extensions;
    using KendoUI.Mvc.Infrastructure;

    public class AutoCompleteHtmlBuilder : IAutoCompleteHtmlBuilder
    {

        public AutoCompleteHtmlBuilder(AutoComplete component)
        {
            this.Component = component;
        }

        public AutoComplete Component
        {
            get;
            private set;
        }

        public IHtmlNode Build()
        {
            string value = Component.GetValue<string>(Component.Value);

            return new HtmlElement("input", TagRenderMode.SelfClosing)
                        .Attributes(new
                        {
                            id = Component.Id,
                            name = Component.Name,
                            type = "text"
                        })
                        .ToggleAttribute("disabled", "disabled", !Component.Enabled)
                        .ToggleAttribute("value", value, value.HasValue())
                        .Attributes(Component.HtmlAttributes)
                        .Attributes(Component.GetUnobtrusiveValidationAttributes())
                        .ToggleClass("input-validation-error", !Component.IsValid())
                        .PrependClass(UIPrimitives.Widget, "t-autocomplete", UIPrimitives.Input);
        }
    }
}