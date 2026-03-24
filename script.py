with open('frontend/src/admin/AdminDashboard.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = lines[:143] + [
    "          {activeTab === 'market' ? (\n",
    "            <MarketPanel />\n",
    "          ) : activeTab === 'workflows' ? (\n",
    "            <WorkflowsPanel setActiveTab={setActiveTab} />\n",
    "          ) : activeTab === 'drawlogs' ? (\n",
    "            <DrawLogsPanel />\n",
    "          ) : activeTab === 'playground' ? (\n",
    "            <PlaygroundPanel />\n",
    "          ) : activeTab === 'nodes' ? (\n",
    "            <NodesPanel />\n",
    "          ) : activeTab === 'settings' ? (\n",
    "            <SettingsPanel />\n",
    "          ) : (\n",
    "            activeTab === 'local' ? <LocalModelsPanel /> : <TasksPanel />\n",
    "          )}\n",
    "        </div>\n",
    "      </main>\n",
    "    </div>\n",
    "  );\n",
    "}\n"
]

with open('frontend/src/admin/AdminDashboard.tsx', 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

