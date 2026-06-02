import { Connector_Installation_Descriptor, Hub_Installation_Descriptor } from "./Types/installation_types.ts";
import $ from "dax";
import * as Path from "@std/path";

export type NGINX_Helper = {
  nginx_file: string,
  //nginx_file_name: string
  enable_command: () => Promise<void>,
  disable_command: () => Promise<void>,
  remove_command: () => Promise<void>,
  add_command: () => Promise<void>,
  certbot_command: () => Promise<void>
}
 
 
 const dest_av = "/etc/nginx/sites-available/";
 const dest_enabled = "/etc/nginx/sites-enabled/";

export function _To_NGINX_Config(url: string, port: number): NGINX_Helper {

  let domain = new URL(url).hostname;

  if(domain=="host.docker.internal"){
    //for testing only
    domain=domain+"_"+port;
  }
 
  let file = `server {
    listen 80;
    server_name ${domain};

    location / {
        proxy_pass http://localhost:${port};
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}`;

  let dest_av_file=`${dest_av}/${domain}`;
  let dest_en_file=`${dest_enabled}/${domain}`;
  return {
    nginx_file: file,
    enable_command: async () => { 
      await $`ln -s ${dest_av_file} ${dest_enabled}`; 

      await $`nginx -t`;

     // await $`systemctl reload nginx`;
    },// `sudo ln -s ${dest_av} ${domain} ${dest_enabled}`,
    disable_command: async () => { 
      await $`rm ${dest_en_file}`;
     },
    remove_command: async () => {
       await $`rm ${dest_av_file}`; 
      },
    add_command: async () => {
      await Deno.writeTextFile(dest_av_file, file);
    },     //$`cp ${domain} ${dest_av}`;},


    certbot_command: async () => { await $`certbot --nginx -d ${domain}  --non-interactive --agree-tos `; }


  }
}


export function To_NGINX_Config_H(item: Hub_Installation_Descriptor): NGINX_Helper[] {

  let hub = _To_NGINX_Config(item.Config.External_Hub_URL, item.Config.ENV_Hub.USE_PORT);
  let kc = _To_NGINX_Config(item.Config.External_KC_URL, item.Config.ENV_KC.USE_PORT);

  return [hub, kc];


}


export function To_NGINX_Config_C(item: Connector_Installation_Descriptor): NGINX_Helper {

  let conn = _To_NGINX_Config(item.Config.External_URL, item.Config.ENV.USE_PORT);


  return conn;


}