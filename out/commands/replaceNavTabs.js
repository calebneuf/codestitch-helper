"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.replaceNavTabs = replaceNavTabs;
const vscode = __importStar(require("vscode"));
function replaceNavTabs(document) {
    const text = document.getText();
    const divPattern = /<div class="cs-ul-wrapper">[\s\S]*?<\/div>/;
    const match = divPattern.exec(text);
    if (match) {
        const edit = new vscode.WorkspaceEdit();
        const startPos = document.positionAt(match.index);
        const endPos = document.positionAt(match.index + match[0].length);
        // Replacement 11ty-compatible navigation markup
        const replacement = `<div class="cs-ul-wrapper">
                <ul id="cs-expanded" class="cs-ul">
                    {% set navPages = collections.all | eleventyNavigation %}

                    {# Loop through all pages with a eleventyNavigation in the frontmatter #}
                    {% for entry in navPages %}

                        {# Define a hasChild variable to make it easier to test what navigation items are have child dropdown pages #}
                        {% set hasChild = entry.children.length %}

                        {# Check the frontmatter for hideOnMobile/hideOnDesktop. Form a list of classes to be joined when the item is rendered #}
                        {% set hideClasses = [] %}
                        {% if entry.hideOnMobile %}
                            {% set hideClasses = (hideClasses.push("cs-hide-on-mobile"), hideClasses) %}
                        {% endif %}
                        {% if entry.hideOnDesktop %}
                            {% set hideClasses = (hideClasses.push("cs-hide-on-desktop"), hideClasses) %}
                        {% endif %}

                        {# If this page is a dropdown, give it the appropriate classes, icons and accessibility attributes #}
                        <li class="cs-li {% if hasChild %} cs-dropdown {% endif %} {{ hideClasses | join(" ") }}">

                            {# If the page has child dropdown pages, render it as a <button> tag with the appropriate dropdown HTML #}
                            {% if hasChild %}

                                {# Check to see if the user's current page is one of the child pages. If so, apply the cs-active class to the dropdown parent #}
                                {% set activeClass = "" %}
                                {% for child in entry.children %}
                                    {% if child.url == page.url %}
                                        {% set activeClass = "cs-active" %}
                                    {% endif %}
                                {% endfor %}

                                {# Render the <button> with the active class, dropdown icon and child links #}
                                <span 
                                    class="cs-li-link {{ activeClass }}"
                                    aria-expanded="false"
                                    aria-controls="dropdown-{{ entry.key }}"
                                    aria-label="dropdown-{{ entry.key }}"
                                >
                                    {{ entry.key }}
                                    <img class="cs-drop-icon" src="https://csimg.nyc3.cdn.digitaloceanspaces.com/Icons%2Fdown.svg" alt="dropdown icon" width="15" height="15" decoding="async" aria-hidden="true">
                                </span>

                                <ul class="cs-drop-ul" id="dropdown-{{ entry.key }}">
                                    {% for child in entry.children %}
                                        <li class="cs-drop-li">
                                            <a href="{{ child.url }}" class="cs-li-link cs-drop-link">{{ child.key }}</a>
                                        </li>
                                    {% endfor %}
                                </ul>
                            {% else %}
                                <a href="{{ entry.url }}" class="cs-li-link {% if entry.url == page.url %} cs-active {% endif %}" {% if entry.url == page.url %} aria-current="page" {% endif %}>
                                    {{ entry.key }}
                                </a>
                            {% endif %}
                        </li>
                    {% endfor %}
                </ul>
            </div>`;
        edit.replace(document.uri, new vscode.Range(startPos, endPos), replacement);
        vscode.workspace.applyEdit(edit).then(success => {
            if (success) {
                vscode.window.showInformationMessage('Replaced nav tabs with 11ty-compatible markup.');
            }
        });
    }
    else {
        vscode.window.showWarningMessage('No <div class="cs-ul-wrapper"> found.');
    }
}
//# sourceMappingURL=replaceNavTabs.js.map