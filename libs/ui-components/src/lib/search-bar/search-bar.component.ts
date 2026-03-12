import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'ui-search-bar',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './search-bar.component.html',
})
export class SearchBarComponent {
  readonly placeholder = input('Search movies');
  readonly value = input('');
  readonly valueChange = output<string>();
}
