import { definePlugin, AttachedPluginData } from "@expressive-code/core"
import { h } from "@expressive-code/core/hast"

interface OutputData {
  output: string[]
}
const outputData = new AttachedPluginData<OutputData>(() => ({ output: [] }))

export function pluginCodeOutput() {
  return definePlugin({
    name: "Code output",
    baseStyles: `
    .expressive-code .frame pre.command {
      border-bottom: none;
      border-bottom-left-radius: 0px;
      border-bottom-right-radius: 0px;
    }
    .expressive-code .frame pre.output {
      display: block;
      color: #EEFFFF;
      border: var(--ec-brdWd) solid var(--ec-brdCol);
      border-top: none;
      padding-top: 0px;
      padding-right: var(--ec-codePadBlk);
      padding-bottom: var(--ec-codePadBlk);
      padding-inline-start: var(--ec-codePadInl);
    }
    .expressive-code .frame pre.output.wrap div {
      white-space: pre-wrap;
      overflow-wrap: break-word;
      min-width: min(20ch, var(--ecMaxLine, 20ch));
    }
      `,
    hooks: {
      preprocessCode: (context) => {
        if (!context.codeBlock.meta.includes("withOutput")) return

        const blockData = outputData.getOrCreateFor(context.codeBlock)
        const outputStart = context.codeBlock
          .getLines()
          .findIndex((line) => !line.text.startsWith("$"))
        context.codeBlock
          .getLines(0, outputStart == -1 ? undefined : outputStart)
          .forEach((line) => {
            // remove the "> "
            line.editText(0, 2, "")
          })
        if (outputStart === -1) return

        context.codeBlock.getLines(outputStart).forEach((line) => {
          blockData.output.push(line.text)
        })

        for (
          let i = context.codeBlock.getLines().length;
          i > outputStart;
          i--
        ) {
          // Do this in reverse direction so there's no issue with line numbers
          // changing as we delete lines
          context.codeBlock.deleteLine(i - 1)
        }
      },
      postprocessRenderedBlock: async (context) => {
        if (!context.codeBlock.meta.includes("withOutput")) return

        const blockData = outputData.getOrCreateFor(context.codeBlock)
        if (!blockData.output.length) return

        const lastPre = context.renderData.blockAst.children.findLastIndex(
          (child) => child.type === "element" && child.tagName === "pre",
        )

        if (lastPre === -1) return

        const currentChildren = context.renderData.blockAst.children
        const command = currentChildren[lastPre]
        const wrapped = context.codeBlock.meta.includes("wrap")
        if (command.type === "element") {
          command.properties["className"] = [
            ...((command.properties["className"] as any) ?? []),
            "command",
          ]
        }
        const newChildren = [
          ...currentChildren.slice(0, lastPre),
          command,
          h(
            `pre.output${wrapped ? ".wrap" : ""}`,
            blockData.output.map((line) => h("div", `${line}`)),
          ),
          ...currentChildren.slice(lastPre + 1),
        ]
        context.renderData.blockAst.children = newChildren
      },
    },
  })
}
