"""Repeatable camera studies of the saved static Blender source."""
from pathlib import Path
import sys, math, importlib.util
import bpy
ROOT=Path(__file__).resolve().parents[2]
spec=importlib.util.spec_from_file_location('authoring',Path(__file__).with_name('build.py'))
a=importlib.util.module_from_spec(spec);spec.loader.exec_module(a)
bpy.ops.wm.open_mainfile(filepath=str(ROOT/'art-source/character-redesign-v2/characters-v2.blend'))
s=bpy.context.scene;s.cycles.samples=24
a.render(s,'body-study',(2.4,-8,3.0),(0,0,.96),2.30,(1200,1300))
a.render(s,'front-study',(0,-8,1.01),(0,0,1.01),2.18,(1200,1300))
