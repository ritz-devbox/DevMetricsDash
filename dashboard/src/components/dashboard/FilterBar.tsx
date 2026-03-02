interface Props {
  repos: string[];
  contributors: string[];
  selectedRepo: string;
  selectedContributor: string;
  onRepoChange: (repo: string) => void;
  onContributorChange: (contributor: string) => void;
}

const selectClass =
  'bg-dark-700/30 border border-dark-600/30 rounded-lg px-3 py-1.5 text-xs text-dark-200 outline-none focus:border-accent-purple/40 transition-colors appearance-none cursor-pointer';

export default function FilterBar({
  repos, contributors, selectedRepo, selectedContributor,
  onRepoChange, onContributorChange,
}: Props) {
  const hasFilter = selectedRepo !== 'all' || selectedContributor !== 'all';

  return (
    <div className="flex flex-wrap items-center gap-3 mb-6">
      <span className="text-[10px] uppercase tracking-wider text-dark-500 font-medium">Filters</span>

      <select value={selectedRepo} onChange={e => onRepoChange(e.target.value)} className={selectClass}>
        <option value="all">All Repositories</option>
        {repos.map(r => <option key={r} value={r}>{r}</option>)}
      </select>

      <select value={selectedContributor} onChange={e => onContributorChange(e.target.value)} className={selectClass}>
        <option value="all">All Contributors</option>
        {contributors.map(c => <option key={c} value={c}>{c}</option>)}
      </select>

      {hasFilter && (
        <button
          onClick={() => { onRepoChange('all'); onContributorChange('all'); }}
          className="text-[10px] text-dark-400 hover:text-accent-purple transition-colors underline underline-offset-2"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
