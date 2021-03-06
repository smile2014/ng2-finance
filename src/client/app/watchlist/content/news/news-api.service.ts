import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import {
  Config,
  CoreApiResponseService
} from '../../../core/index';
import { NewsStateService } from './state/index';
declare let moment:any;
declare let _:any;

@Injectable()
export class NewsApiService extends CoreApiResponseService {
  private stock:string;

  constructor(public http:Http,
              private newsState:NewsStateService) {
    super(http, newsState);
  }

  load(stock:string) {
    this.stock = stock;
    this.newsState.fetchLoader(true);
    let url:string = Config.paths.news.replace('$stock', encodeURIComponent(stock));
    if (Config.env === 'PROD') {
      this.post(Config.paths.proxy, 'url=' + encodeURIComponent(url))
        .subscribe(
          data => this.complete(this.transform(data)),
          () => this.failed()
        );
    } else {
      this.get(url)
        .subscribe(
          data => this.complete(this.transform(data)),
          () => this.failed()
        );
    }
  }

  reload() {
    this.load(this.stock);
  }

  private transform(data:any):NewsDataInterface[] {
    let news:any[] = _.get(data, 'Content.result', []);
    return news.map((item:any) => {
      return {
        source: item.provider_name,
        date: this.convertDate(item.provider_publish_time),
        title: item.title,
        url: item.url,
        image: item.thumbnail
      };
    });
  }

  private convertDate(date:number):string {
    return moment(date * 1000).format('ddd, MMM Do YYYY h:mm A');
  }
}

export interface NewsDataInterface {
  source?:string;
  date?:string;
  title?:string;
  url?:string;
  image?:string;
}
