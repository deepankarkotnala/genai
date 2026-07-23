(function(){
  'use strict';
  var track=document.querySelector('[data-track]');
  var hours=document.querySelector('[data-hours]');
  var prompts={
    coding:[
      'Given a stream of integers, return the length of the longest contiguous subarray containing at most two distinct values. Explain the brute-force approach, optimize it, implement it in Python, and test edge cases.',
      'Design an algorithm to merge overlapping meeting intervals and then answer whether a new meeting can be inserted without conflict. State complexity and write production-quality Python.',
      'Given a directed graph of service dependencies, return a valid deployment order or report a cycle. Explain your representation and failure cases.'
    ],
    python:[
      'A FastAPI endpoint becomes slow under concurrent I/O. Diagnose likely causes, explain threads versus asyncio, and sketch a tested correction.',
      'Refactor a Python function that mixes validation, database access and business logic. Describe boundaries, error handling, typing and tests.',
      'Implement an in-memory TTL cache in Python. Discuss thread safety, eviction, testing and when not to build this yourself.'
    ],
    design:[
      'Design a distributed Python job-execution platform that accepts jobs, schedules workers, retries safely, reports progress and prevents duplicate execution.',
      'Design a file-processing service for large CSV uploads. Cover APIs, storage, queues, workers, idempotency, status tracking, failures and capacity.',
      'Design a metrics ingestion and alerting platform. Estimate load, choose storage, handle late events and explain reliability trade-offs.'
    ],
    behaviour:[
      'Tell me about a technically important decision where you changed your mind after receiving evidence from a colleague.',
      'Describe a time you operated in ambiguity. How did you create clarity without waiting for perfect requirements?',
      'Tell me about a failure you personally caused or failed to prevent. What changed in your engineering practice afterward?'
    ],
    scenario:[
      'A client demands a Friday launch, but testing shows intermittent data corruption. Product wants to proceed. Walk through your decision and communication.',
      'Two senior engineers disagree on architecture and the debate is blocking delivery. You are not their manager. What do you do?',
      'A production incident occurs while a junior engineer is primary on-call. Explain how you protect the system while preserving their ownership and learning.'
    ],
    resume:[
      'Choose the strongest Python/backend project on your resume. Precisely separate what you designed, coded, reviewed and merely observed. Then explain one hard trade-off.',
      'You report a major runtime improvement. Establish the baseline, measurement method, exact change, alternative explanations and production impact.',
      'Explain an API or data pipeline you worked on as if I am inheriting it tomorrow: contracts, dependencies, failure modes, tests, monitoring and unresolved debt.'
    ]
  };

  function renderTrack(){
    var value=track ? track.value : 'python';
    document.querySelectorAll('[data-track-panel]').forEach(function(panel){
      panel.hidden=panel.getAttribute('data-track-panel')!==value;
    });
  }

  function renderWeek(){
    var host=document.querySelector('[data-week-plan]');
    if(!host) return;
    var h=parseInt(hours ? hours.value : '10',10);
    var value=track ? track.value : 'python';
    var plan;
    if(value==='ml'){
      plan=[['Python and DSA',Math.round(h*.35),'Timed Python practice and one DSA pattern.'],['ML/data systems',Math.round(h*.30),'Model serving, pipelines, storage or distributed processing.'],['System design',Math.round(h*.20),'One component lesson or timed architecture drill.'],['Interview stories',Math.max(1,h-Math.round(h*.35)-Math.round(h*.30)-Math.round(h*.20)),'Rehearse project ownership and behavioural evidence.']];
    }else if(value==='dual'){
      plan=[['Python and DSA',Math.round(h*.40),'Core coding fluency shared by both tracks.'],['Backend engineering',Math.round(h*.22),'API, database, testing or concurrency practice.'],['ML/data systems',Math.round(h*.22),'One specialized systems topic.'],['Mocks and review',Math.max(1,h-Math.round(h*.40)-Math.round(h*.22)-Math.round(h*.22)),'Timed answer practice and error review.']];
    }else{
      plan=[['Python without AI',Math.round(h*.35),'Implement, test and debug one small program or API.'],['DSA patterns',Math.round(h*.35),'Study one pattern and solve several problems.'],['Backend/system design',Math.round(h*.20),'Advance a service or practise one design component.'],['Behavioural review',Math.max(1,h-Math.round(h*.35)-Math.round(h*.35)-Math.round(h*.20)),'Explain one real project or STAR story aloud.']];
    }
    host.innerHTML=plan.map(function(item){return '<article><b>'+item[1]+'h</b><div><h3>'+item[0]+'</h3><p>'+item[2]+'</p></div></article>';}).join('');
  }

  if(track){track.addEventListener('change',function(){renderTrack();renderWeek();});}
  if(hours){hours.addEventListener('change',renderWeek);}

  document.querySelectorAll('[data-prompt]').forEach(function(btn){
    btn.addEventListener('click',function(){
      var list=prompts[btn.getAttribute('data-prompt')];
      if(!list) return;
      var box=document.querySelector('[data-prompt-box]');
      if(!box) return;
      box.hidden=false;
      var type=box.querySelector('[data-prompt-type]');
      var text=box.querySelector('[data-prompt-text]');
      if(type){var article=btn.closest('article');type.textContent=article&&article.querySelector('h3')?article.querySelector('h3').textContent:'Practice prompt';}
      if(text) text.textContent=list[Math.floor(Math.random()*list.length)];
      box.scrollIntoView({behavior:'smooth',block:'center'});
    });
  });
  var close=document.querySelector('[data-close-prompt]');
  if(close) close.addEventListener('click',function(){var box=document.querySelector('[data-prompt-box]');if(box)box.hidden=true;});

  renderTrack();
  renderWeek();
})();
