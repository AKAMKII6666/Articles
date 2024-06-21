WAI-ARIA 规范定义了多种属性，这些属性可以分为几个主要类别：角色（Roles）、状态（States）、属性（Properties）和关系（Relationships）。由于 WAI-ARIA 规范非常庞大，包含许多属性，这里我将列举一些常见的属性，并简要说明它们的使用规范。

角色（Roles）
角色定义了元素在页面上的功能或目的。例如：

role="button"：表示元素是一个按钮。
role="checkbox"：表示元素是一个复选框。
role="dialog"：表示元素是一个对话框。
role="navigation"：表示元素是一个导航区域。
role="search"：表示元素是一个搜索框。
role="tab"：表示元素是一个选项卡。
role="tooltip"：表示元素是一个提示框。
状态（States）
状态表示元素的当前条件或状态。例如：

aria-checked="true"：表示复选框或单选按钮被选中。
aria-disabled="true"：表示元素是禁用的。
aria-expanded="true"：表示元素是展开的。
aria-hidden="true"：表示元素对辅助技术是隐藏的。
aria-pressed="true"：表示按钮是被按下的。
aria-selected="true"：表示选项是被选中的。
属性（Properties）
属性提供关于元素的额外信息。例如：

aria-label="描述"：为元素提供一个可访问的标签。
aria-labelledby="id"：引用另一个元素的 ID，该元素的文本内容作为当前元素的标签。
aria-describedby="id"：引用另一个元素的 ID，该元素的文本内容作为当前元素的描述。
aria-haspopup="true"：表示元素有一个弹出菜单或对话框。
aria-owns="id"：表示元素拥有其他元素的焦点顺序。
aria-live="polite"：表示元素的内容变化时，辅助技术应该以礼貌的方式通知用户。
关系（Relationships）
关系属性定义了元素之间的关系。例如：

aria-activedescendant="id"：表示当前活跃的子元素的 ID。
aria-controls="id"：表示当前元素控制的元素的 ID。
aria-labelledby="id"：如上所述，用于引用其他元素作为当前元素的标签。
aria-owns="id"：如上所述，用于表示元素拥有其他元素。
使用规范
避免重复：不要使用 ARIA 属性重复已经由 HTML 元素提供的语义信息。
保持一致性：确保 ARIA 属性与元素的其他属性和行为保持一致。
测试：在使用 ARIA 属性时，进行充分的测试以确保它们在不同的辅助技术上都能正常工作。
遵循 WAI-ARIA 规范：始终参考最新的 WAI-ARIA 规范文档，以获取最准确的信息和最佳实践。
WAI-ARIA 规范是一个不断发展的文档，因此建议定期查看 W3C 的官方文档以获取最新的信息和最佳实践。此外，由于 ARIA 属性的使用可能会影响页面的可访问性，因此在使用时应谨慎，并确保进行适当的测试和验证。