# About Text Pattern Matcher
These elements allow you to watch multiple input fields for multiple patterns and then return a custom list of suggestions for each match.

# Use
```
bower install x-tag-text-pattern-matcher
```
# Example

```
// describe usage

<p>Enter text that begins with # or @</p>
<input type="text" class="tagFields">
<p>A single tag can watch multiple inputs</p>
<input type="text" class="tagFields">

<x-text-pattern-matcher target="input.tagFields">
  <x-pattern-matcher split="(#\w+)" select="#(\w+)" onmatch="matchColors"></x-pattern-matcher>
  <x-pattern-matcher split="(@\w+)" select="@(\w+)" onmatch="matchUsers"></x-pattern-matcher>
  <x-pattern-matcher split="(@)" select="@" onmatch="topUsers"></x-pattern-matcher>
</x-text-pattern-matcher>

function matchColors(match, callback){
	callback([]);
}

function matchUsers(match, callback){
	callback([]);
}

function topUsers(match, callback){
	callback([]);
}

```



# Links

[Yeoman X-Tag Generator](https://github.com/x-tag/yo-x-tag-generator)

[X-Tags Docs](http://x-tags.org/docs)

[Guide for creating X-Tag Components](https://github.com/x-tag/core/wiki/Creating-X-Tag-Components)

[Using X-Tag components in your applications](https://github.com/x-tag/core/wiki/Using-our-Web-Components-in-Your-Application)


