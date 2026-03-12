import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SiMagnifyingGlassIcon } from '@semantic-icons/heroicons/24/outline';

@Component({
  selector: 'ui-search-bar',
  standalone: true,
  imports: [FormsModule, SiMagnifyingGlassIcon],
  templateUrl: './search-bar.component.html',
})
export class SearchBarComponent {
  readonly placeholder = input('Search movies');
  readonly value = input('');
  readonly valueChange = output<string>();
}
