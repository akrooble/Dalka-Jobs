"use client";

import { useRef, useState } from "react";
import { employerTypes, jobTypes, PREVIEW_DATE_LABEL } from "../lib/demo-jobs";
import { useDemo } from "./frontend/demo-provider";
import { emptyFilters, filterJobs, type JobFilters } from "../lib/job-search";
import { JobCard } from "./job-card";
import { Dialog } from "./ui/dialog";
import { Pagination } from "./ui/pagination";
import { paginate } from "../lib/ui";
import { MobileNavigation } from "./mobile-navigation";

export function JobBrowser() {
  const { state } = useDemo();
  const demoJobs = state.jobs.filter(job => job.status === "Published");
  const { categories, locations } = state;
  const [filters, setFilters] = useState<JobFilters>(emptyFilters);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [page, setPage] = useState(1);
  const resultsHeading = useRef<HTMLHeadingElement>(null);
  const focusAfterFilters = useRef(false);
  const results = filterJobs(demoJobs, filters);
  const paged = paginate(results, page, 6);
  const activeFilters = (["keyword", "location", "category", "employerType", "jobType", "closingSoon"] as const).filter(key => Boolean(filters[key]));
  const hasFilters = Boolean(filters.keyword || filters.location || filters.category || filters.employerType || filters.jobType || filters.closingSoon || filters.sort === "closing");

  function updateFilter<K extends keyof JobFilters>(field: K, value: JobFilters[K]) {
    setFilters((previous) => ({ ...previous, [field]: value }));
    setPage(1);
  }

  function showResults() {
    resultsHeading.current?.focus();
  }

  function browseLocation(location: string) {
    setFilters({ ...emptyFilters(), location });
    setPage(1);
    showResults();
  }

  return (
    <>
      <section className="container jobs-section" id="jobs" aria-label="Browse sample jobs">
        <p className="preview-snapshot">Example dates are shown as of <strong>{PREVIEW_DATE_LABEL}</strong>. These are not live vacancies.</p>
        <form className="job-browser" onSubmit={(event) => { event.preventDefault(); showResults(); }}>
          <div className="search-panel">
            <div className="search-input-wrap">
              <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 5 5" /></svg>
              <label className="sr-only" htmlFor="keyword">Search by job title, keyword or employer</label>
              <input id="keyword" type="search" placeholder="Job title, keyword or employer" value={filters.keyword} onChange={(event) => updateFilter("keyword", event.target.value)} />
            </div>
            <div className="search-select"><label htmlFor="search-location" className="sr-only">Search location</label><select id="search-location" value={filters.location} onChange={e => updateFilter("location", e.target.value)}><option value="">All regions / cities</option>{locations.map(location => <option key={location}>{location}</option>)}</select></div>
            <div className="search-select search-category"><label htmlFor="search-category" className="sr-only">Search category</label><select id="search-category" value={filters.category} onChange={e => updateFilter("category", e.target.value)}><option value="">All categories</option>{categories.map(category => <option key={category}>{category}</option>)}</select></div>
            <button type="button" className="mobile-filter-trigger button button-secondary" aria-haspopup="dialog" onClick={() => setFiltersOpen(true)}>Filters <span>{activeFilters.length}</span></button>
            <button type="submit" className="button button-primary">Search jobs <span aria-hidden="true">↗</span></button>
          </div>
          <div className="popular-searches">
            <span>Try a search</span>
            {["Engineer", "Health", "Finance"].map((keyword) => (
              <button type="button" key={keyword} onClick={() => { setFilters({ ...emptyFilters(), keyword }); setPage(1); }}>{keyword} <span aria-hidden="true">↗</span></button>
            ))}
          </div>
          <div className="quick-filters" aria-label="Quick filters"><button type="button" aria-pressed={!hasFilters} onClick={() => { setFilters(emptyFilters()); setPage(1); }}>All jobs <span>{demoJobs.length}</span></button><button type="button" aria-pressed={filters.closingSoon ?? false} onClick={() => updateFilter("closingSoon", !filters.closingSoon)}>Closing soon</button><button type="button" aria-pressed={filters.employerType === "NGO"} onClick={() => updateFilter("employerType", filters.employerType === "NGO" ? "" : "NGO")}>NGO</button><button type="button" aria-pressed={filters.jobType === "Full-time"} onClick={() => updateFilter("jobType", filters.jobType === "Full-time" ? "" : "Full-time")}>Full-time</button></div>
          <div className="results-layout">
            <aside className="filters-panel" aria-labelledby="filter-heading">
              <div className="filter-title-row"><h2 id="filter-heading">Refine your search</h2><span aria-hidden="true">≡</span></div>
              <div className="filter-field">
                <label htmlFor="location">Location</label>
                <select id="location" value={filters.location} onChange={(event) => updateFilter("location", event.target.value)}>
                  <option value="">All locations</option>
                  {locations.map((location) => <option key={location}>{location}</option>)}
                </select>
              </div>
              <div className="filter-field">
                <label htmlFor="category">Category</label>
                <select id="category" value={filters.category} onChange={(event) => updateFilter("category", event.target.value)}>
                  <option value="">All categories</option>
                  {categories.map((category) => <option key={category}>{category}</option>)}
                </select>
              </div>
              <div className="filter-field">
                <label htmlFor="employer-type">Employer type</label>
                <select id="employer-type" value={filters.employerType ?? ""} onChange={(event) => updateFilter("employerType", event.target.value)}>
                  <option value="">All employers</option>
                  {employerTypes.map((type) => <option key={type}>{type}</option>)}
                </select>
              </div>
              <div className="filter-field">
                <label htmlFor="job-type">Job type</label>
                <select id="job-type" value={filters.jobType ?? ""} onChange={(event) => updateFilter("jobType", event.target.value)}>
                  <option value="">All job types</option>
                  {jobTypes.map((type) => <option key={type}>{type}</option>)}
                </select>
              </div>
              <label className="checkbox-filter" htmlFor="closing-soon"><input id="closing-soon" type="checkbox" checked={filters.closingSoon ?? false} onChange={(event) => updateFilter("closingSoon", event.target.checked)} /><span>Closing within 7 days<span className="checkbox-hint">Based on the preview date</span></span></label>
              <button type="button" className="reset-button" onClick={() => { setFilters(emptyFilters()); setPage(1); }} disabled={!hasFilters}>Clear all filters <span aria-hidden="true">↺</span></button>
              <div className="search-tip"><span className="eyebrow">A small tip</span><p>Keep your search broad. Your next opportunity might be somewhere unexpected.</p></div>
            </aside>
            <div className="results-panel">
              <div className="results-header">
                <div><p className="eyebrow">Discover what’s next</p><h2 ref={resultsHeading} tabIndex={-1}>Explore opportunities<span className="result-number">{results.length}</span></h2></div>
                <span className="sample-badge">Sample listings</span>
              </div>
              <div className="results-toolbar"><p className="result-status" role="status" aria-live="polite" aria-atomic="true">Showing {results.length} of {demoJobs.length} sample jobs{hasFilters ? " matching your selection" : " across Somalia"}.</p><div className="sort-control"><label htmlFor="sort">Sort by</label><select id="sort" value={filters.sort ?? "newest"} onChange={(event) => updateFilter("sort", event.target.value as JobFilters["sort"])}><option value="newest">Newest first</option><option value="closing">Closing date</option></select></div></div>
              {activeFilters.length > 0 && <div className="active-filters" aria-label="Selected filters">{activeFilters.map(key => <button type="button" key={key} aria-label={`Remove ${key === "closingSoon" ? "closing within 7 days" : filters[key]} filter`} onClick={() => updateFilter(key, key === "closingSoon" ? false : "")}>{key === "closingSoon" ? "Closing within 7 days" : filters[key]} <span aria-hidden="true">×</span></button>)}</div>}
              <div className="job-list">
                {paged.rows.map((job, index) => <JobCard key={job.id} job={job} index={(paged.page - 1) * 6 + index} />)}
                {results.length === 0 && <div className="empty-state"><span className="empty-symbol" aria-hidden="true">⌕</span><h3>No matches just yet.</h3><p>Try a broader keyword or choose another location or category.</p><button type="button" className="button button-primary" onClick={() => { setFilters(emptyFilters()); setPage(1); }}>Clear filters and explore</button></div>}
              </div>
              <div className="public-pagination"><p>Showing {paged.from}–{paged.to} of {paged.totalRows} sample jobs</p><Pagination page={paged.page} totalPages={paged.totalPages} onPageChange={value => { setPage(value); showResults(); }} label="Job result pages" /></div>
            </div>
          </div>
        </form>
      </section>
      <Dialog open={filtersOpen} onClose={() => setFiltersOpen(false)} onClosed={() => { if (focusAfterFilters.current) { focusAfterFilters.current = false; showResults(); } }} title="Filter results" description="Changes update your sample results immediately."><div className="desk-form">{([["location", "Location", locations], ["category", "Category", categories], ["employerType", "Employer type", employerTypes], ["jobType", "Job type", jobTypes]] as const).map(([field, label, options]) => <div className="filter-field" key={field}><label htmlFor={`mobile-${field}`}>{label}</label><select id={`mobile-${field}`} value={filters[field] ?? ""} onChange={e => updateFilter(field, e.target.value)}><option value="">All</option>{options.map(option => <option key={option}>{option}</option>)}</select></div>)}<label className="checkbox-filter"><input type="checkbox" checked={filters.closingSoon ?? false} onChange={e => updateFilter("closingSoon", e.target.checked)} />Closing within 7 days</label><button type="button" className="button button-secondary" onClick={() => { setFilters(emptyFilters()); setPage(1); }}>Reset filters</button><button type="button" className="button button-primary" onClick={() => { focusAfterFilters.current = true; setFiltersOpen(false); }}>Show {results.length} sample jobs</button></div></Dialog>
      <MobileNavigation active="home" />
      <section className="locations-section" id="locations" aria-labelledby="locations-heading">
        <div className="container">
          <div className="section-intro"><div><p className="eyebrow">Closer to home. Or somewhere new.</p><h2 id="locations-heading">Where will your next chapter be?</h2></div><p>Explore our sample collection by location.</p></div>
          <div className="location-grid">
            {locations.filter(location => ["Mogadishu", "Hargeisa", "Garowe", "Remote"].includes(location) || demoJobs.some(job => job.location === location)).slice(0, 6).map((location, index) => {
              const count = demoJobs.filter((job) => job.location === location).length;
              return <button className="location-tile" key={location} type="button" onClick={() => browseLocation(location)}><span className="location-index" aria-hidden="true">0{index + 1} /</span><span className="location-name">{location}</span><span className="location-count">{count} sample {count === 1 ? "job" : "jobs"}</span><span className="location-arrow" aria-hidden="true">↗</span></button>;
            })}
          </div>
        </div>
      </section>
    </>
  );
}
