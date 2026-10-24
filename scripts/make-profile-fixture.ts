import {readFileSync,writeFileSync} from "node:fs";
import {decodeSave,encodeSave} from "../src/persistence/saves";
import {transition} from "../src/simulation/engine";
import {EVENTS} from "../src/content/events";
import type {Command} from "../src/simulation/types";
let s=await decodeSave(readFileSync('evidence/fixtures/office-12.json','utf8'));
const trace:Command[]=[];const send=(c:Command)=>{const r=transition(s,c);if(!r.ok)throw Error(r.error?.en);s=r.state;trace.push(c)};
send({type:'tick',days:3});
for(const e of s.events.filter(e=>!e.resolved&&e.due<=s.day)){
 const choice=EVENTS.find(t=>t.id===e.templateId)!.choices.find(c=>c.cost===0&&!c.immediate.promise&&!c.delay)!;
 send({type:'decide',eventId:e.id,choiceId:choice.id});
}
writeFileSync('evidence/fixtures/office-12-profile.json',await encodeSave(s));writeFileSync('evidence/fixtures/profile-fixture-trace.json',JSON.stringify({base:'office-12.json',trace,day:s.day},null,2));console.log(s.day,s.employees.length,s.actions);
