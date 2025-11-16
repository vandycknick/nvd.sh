import { LinkedinIcon, GithubIcon, TwitterIcon } from "@/components/Icons"
import {
  Snippet,
  SnippetCopyButton,
  SnippetHeader,
  SnippetTabsContent,
  SnippetTabsList,
  SnippetTabsTrigger,
} from "@/components/ui/shadcn-io/snippet"
import { TerminalIcon } from "lucide-react"
import { useState } from "react"

const commands = [
  {
    label: "ssh",
    icon: TerminalIcon,
    code: "ssh nvd.sh",
    url: "https://nvd.sh",
  },
  {
    label: "github",
    icon: GithubIcon,
    code: "gh browse -R vandycknick/nvd.sh",
    url: "https://github.com/vandycknick",
  },
  {
    label: "twitter",
    icon: TwitterIcon,
    code: "open https://x.com/vandycknick",
    url: "https://x.com/vandycknick",
  },
  {
    label: "linkedin",
    icon: LinkedinIcon,
    code: "firefox linkedin.com/in/nickvandyck",
    url: "https://www.linkedin.com/in/nickvandyck",
  },
]

export const Socials = () => {
  const [value, setValue] = useState(commands[0].label)
  const activeCommand = commands.find((command) => command.label === value)
  return (
    <Snippet onValueChange={setValue} value={value}>
      <SnippetHeader>
        <SnippetTabsList>
          {commands.map((command) => (
            <SnippetTabsTrigger key={command.label} value={command.label}>
              <command.icon size={14} />
              <span>{command.label}</span>
            </SnippetTabsTrigger>
          ))}
        </SnippetTabsList>
        {activeCommand && <SnippetCopyButton value={activeCommand.url} />}
      </SnippetHeader>
      {commands.map((command) => (
        <SnippetTabsContent key={command.label} value={command.label}>
          <span className="text-teal-600 dark:text-teal-400">$ </span>
          {command.code}
        </SnippetTabsContent>
      ))}
    </Snippet>
  )
}
