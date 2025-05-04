// highlight.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'highlight',
  standalone: true, // ✅ si estás usando standalone
})
export class HighlightPipe implements PipeTransform {
  transform(text: string, search: string): any {
    if (!search) return text;
    const regex = new RegExp(`(${search})`, 'gi');
    return text.replace(regex, `<mark>$1</mark>`);
  }
}
